const Event = require('../../models/event');
const User = require('../../models/user');
const bcrypt = require('bcrypt');

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });

        return events.map(event => {
            return { 
                ...event._doc, 
                _id: event.id, 
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator),
            };
        });
    } catch(err) {
        throw err;
    };
}

const user = async userId => {
    try {
        const creator = await User.findById(userId);

        return { 
            ...creator._doc, 
            _id: creator.id, 
            createdEvents: events.bind(this, creator._doc.createdEvents), 
        };
    } catch(err) {
        throw err;
    };
}



module.exports = {
    events: async () => {
        try {
            const events = await Event.find();

            return events.map(event => {
                return { 
                    ...event._doc, 
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator),
                };
            });
        } catch(err) {
            throw err;
        };
    },
    createEvent: async ({eventInput}) => {
        const event = new Event({
            title: eventInput.title,
            description: eventInput.description,
            price: +eventInput.price,
            date: new Date(eventInput.date),
            creator: '5c7af6431e35d731d03f4a6a',
        });
        let createdEvent;

        try {
            const result = await event.save();
            createdEvent = {
                ...result._doc, 
                id: result._doc._id.toString(), 
                creator: user.bind(this, result._doc.creator)
            };
            const creator = await User.findById('5c7af6431e35d731d03f4a6a');

            if (!creator) {
                throw new Error('No such user');
            }

            creator.createdEvents.push(event);
            await creator.save();

            return createdEvent;
        } catch(err) {
            throw err;
        };
    },
    createUser: async ({userInput}) => {
        try {
            const existingUser = await User.findOne({email: userInput.email});

            if (existingUser) {
                throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(userInput.password, 12);
            const newUser = new User({
                email: userInput.email,
                password: hashedPassword,
            });
            const result = await newUser.save();

            return { ...result._doc, password: null, _id: result.id };
        } catch(err) {
            throw err;
        };
    }
};