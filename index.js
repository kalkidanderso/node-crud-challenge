const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');
const Joi = require('joi');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

let persons = [{
    id: '1',
    name: 'Sam',
    age: '26',
    hobbies: []    
}];

app.set('db', persons);

// Validation schema
const personSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required(),
    hobbies: Joi.array().items(Joi.string()).required()
});

// GET all persons
app.get('/person', (req, res) => {
    try {
        const persons = app.get('db');
        res.status(200).json(persons);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET person by ID
app.get('/person/:id', (req, res) => {
    try {
        const persons = app.get('db');
        const person = persons.find(p => p.id === req.params.id);
        
        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }
        
        res.status(200).json(person);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST new person
app.post('/person', (req, res) => {
    try {
        const { error } = personSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const newPerson = {
            id: uuidv4(),
            ...req.body
        };

        const persons = app.get('db');
        persons.push(newPerson);
        app.set('db', persons);

        res.status(200).json(newPerson);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update person
app.put('/person/:id', (req, res) => {
    try {
        const { error } = personSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const persons = app.get('db');
        const index = persons.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Person not found' });
        }

        persons[index] = {
            id: req.params.id,
            ...req.body
        };

        app.set('db', persons);
        res.status(200).json(persons[index]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE person
app.delete('/person/:id', (req, res) => {
    try {
        const persons = app.get('db');
        const filteredPersons = persons.filter(p => p.id !== req.params.id);
        
        if (filteredPersons.length === persons.length) {
            return res.status(404).json({ error: 'Person not found' });
        }

        app.set('db', filteredPersons);
        res.status(200).json({ message: 'Person deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle non-existing endpoints
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}

module.exports = app;