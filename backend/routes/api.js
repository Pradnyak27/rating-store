const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Make sure this path is correct
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');
const { User, Store, Rating } = require('../db');

// Route for new user registration
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, address } = req.body;
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        
        const newUserInstance = await User.create({ name, email, password, address, role: 'Normal User' });
        
        const token = jwt.sign(
            { userId: newUserInstance.id, role: newUserInstance.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        const userWithoutPassword = newUserInstance.toJSON();
        delete userWithoutPassword.password;

        res.status(201).json({ 
            message: 'User created successfully', 
            token, 
            user: userWithoutPassword 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user', error });
    }
});

// Route for user login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({ message: 'Logged in successfully', token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// ADMIN ONLY: Route to create a new user
router.post('/users', auth, async (req, res) => {
    if (req.userData.role !== 'System Administrator') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const { name, email, password, address, role } = req.body;
        const newUser = await User.create({ name, email, password, address, role });
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user', error });
    }
});

// ADMIN ONLY: Route to get a list of all users
router.get('/users', auth, async (req, res) => {
    if (req.userData.role !== 'System Administrator') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const { filter, sort, order } = req.query;
        let where = {};
        let orderClause = [];

        if (filter) {
            where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${filter}%` } },
                    { email: { [Op.like]: `%${filter}%` } },
                    { address: { [Op.like]: `%${filter}%` } },
                    { role: { [Op.like]: `%${filter}%` } },
                ],
            };
        }

        if (sort && order) {
            orderClause.push([sort, order.toUpperCase()]);
        }

        const users = await User.findAll({
            where,
            order: orderClause,
            attributes: ['id', 'name', 'email', 'address', 'role'],
        });

        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// ADMIN ONLY: Route to get a list of all store owners
router.get('/users/store-owners', auth, async (req, res) => {
    if (req.userData.role !== 'System Administrator') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const storeOwners = await User.findAll({
            where: { role: 'Store Owner' }, // <-- This is the only correct way.
            attributes: ['id', 'name', 'email'],
        });
        res.status(200).json({ users: storeOwners });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching store owners', error });
    }
});

// ALL USERS: Route to get a user's profile
router.get('/users/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'address', 'role'],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ user });
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user profile', error });
    }
});

// ALL USERS: Route to change a user's password
router.put('/users/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.userData.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating password', error });
    }
});

// ADMIN ONLY: Route to create a new store
router.post('/stores', auth, async (req, res) => {
    if (req.userData.role !== 'System Administrator') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const { name, email, address, storeOwnerId } = req.body;
        const newStore = await Store.create({ name, email, address, storeOwnerId });
        res.status(201).json({ message: 'Store created successfully', store: newStore });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating store', error });
    }
});

// ALL USERS: Route to get a list of all stores with average rating and user's rating
router.get('/stores', auth, async (req, res) => {
    try {
        const { search, sort, order } = req.query;
        let where = {};
        let orderClause = [];

        if (search) {
            where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { address: { [Op.like]: `%${search}%` } },
                ],
            };
        }

        if (sort && order) {
            orderClause.push([sort, order.toUpperCase()]);
        }
        
        const stores = await Store.findAll({
            where,
            order: orderClause,
            attributes: {
                include: [
                    [Sequelize.fn('AVG', Sequelize.col('Ratings.value')), 'overallRating'],
                    [Sequelize.literal(`(
                        SELECT \`value\`
                        FROM \`Ratings\` AS \`Rating\`
                        WHERE \`Rating\`.\`storeId\` = \`Store\`.\`id\`
                        AND \`Rating\`.\`userId\` = ${req.userData.userId}
                    )`), 'userRating']
                ],
                exclude: ['storeOwnerId', 'createdAt', 'updatedAt'],
            },
            include: [{
                model: Rating,
                attributes: [],
            }],
            group: ['Store.id'],
        });

        res.status(200).json({ stores });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching stores', error });
    }
});

// NORMAL USER: Route to submit a rating
router.post('/ratings', auth, async (req, res) => {
    if (req.userData.role !== 'Normal User') {
        return res.status(403).json({ message: 'Access denied. Only normal users can submit ratings.' });
    }
    try {
        const { storeId, value } = req.body;
        if (value < 1 || value > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }
        const existingRating = await Rating.findOne({ where: { userId: req.userData.userId, storeId } });
        if (existingRating) {
            return res.status(409).json({ message: 'You have already rated this store. Please update your existing rating.' });
        }
        const newRating = await Rating.create({ storeId, value, userId: req.userData.userId });
        res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting rating', error });
    }
});

// NORMAL USER: Route to update a rating
router.put('/ratings/:storeId', auth, async (req, res) => {
    if (req.userData.role !== 'Normal User') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const { storeId } = req.params;
        const { value } = req.body;
        if (value < 1 || value > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }
        const rating = await Rating.findOne({ where: { storeId, userId: req.userData.userId } });
        if (!rating) {
            return res.status(404).json({ message: 'Rating not found.' });
        }
        rating.value = value;
        await rating.save();
        res.status(200).json({ message: 'Rating updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating rating', error });
    }
});

// NORMAL USER: Route to delete a rating
router.delete('/ratings/:storeId', auth, async (req, res) => {
    if (req.userData.role !== 'Normal User') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const { storeId } = req.params;
        const rating = await Rating.findOne({ where: { storeId, userId: req.userData.userId } });
        if (!rating) {
            return res.status(404).json({ message: 'Rating not found.' });
        }
        await rating.destroy();
        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting rating', error });
    }
});

// ADMIN ONLY: Route to get a list of all store owners


// ADMIN ONLY: Route to get a summary of the entire platform
router.get('/admin/dashboard', auth, async (req, res) => {
    if (req.userData.role !== 'System Administrator') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const totalUsers = await User.count();
        const totalStores = await Store.count();
        const totalRatings = await Rating.count();
        res.status(200).json({
            totalUsers,
            totalStores,
            totalRatings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard data', error });
    }
});

// STORE OWNER ONLY: Route to get dashboard data for a store owner
router.get('/owner/dashboard', auth, async (req, res) => {
    if (req.userData.role !== 'Store Owner') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const store = await Store.findOne({ where: { storeOwnerId: req.userData.userId } });
        if (!store) {
            return res.status(404).json({ message: 'Store not found for this user.' });
        }

        const averageRating = await Rating.findOne({
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('value')), 'averageRating']
            ],
            where: { storeId: store.id },
            raw: true
        });

        const usersWhoRated = await Rating.findAll({
            where: { storeId: store.id },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email', 'address'],
            }],
            attributes: ['value'],
        });

        res.status(200).json({
            store,
            averageRating: averageRating.averageRating,
            usersWhoRated,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching owner dashboard data', error });
    }
});

// STORE OWNER ONLY: Route to update a store's details
router.put('/stores/:id', auth, async (req, res) => {
    if (req.userData.role !== 'Store Owner') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const { id } = req.params;
        const { name, email, address } = req.body;
        
        const store = await Store.findOne({ where: { id, storeOwnerId: req.userData.userId } });

        if (!store) {
            return res.status(404).json({ message: 'Store not found or you are not the owner.' });
        }
        
        await store.update({ name, email, address });

        res.status(200).json({ message: 'Store updated successfully', store });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating store', error });
    }
});

// TEMPORARY: Route to create a System Administrator for initial setup
router.post('/setup-admin', async (req, res) => {
    try {
        const { name, email, password, address } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        
        // Create the user with the 'System Administrator' role
        const newUserInstance = await User.create({ name, email, password, address, role: 'System Administrator' });
        
        const token = jwt.sign(
            { userId: newUserInstance.id, role: newUserInstance.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        const userWithoutPassword = newUserInstance.toJSON();
        delete userWithoutPassword.password;

        res.status(201).json({ 
            message: 'Admin user created successfully', 
            token, 
            user: userWithoutPassword 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating admin user', error });
    }
});

module.exports = router;