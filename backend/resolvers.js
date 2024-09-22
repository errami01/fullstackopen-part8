const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");
const jwt = require("jsonwebtoken");

const { PubSub } = require("graphql-subscriptions");
const { GraphQLError } = require("graphql");

const pubsub = new PubSub();

const resolvers = {
  Query: {
    authorCount: async () => await Author.countDocuments(),
    allBooks: async (root, args) => {
      if (args.genre && args.author) {
        const author = await Author.findOne({ name: args.author });
        return Book.find({ author: author.id, genres: args.genre });
      }
      if (args.genre) return Book.find({ genres: args.genre });
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        return Book.find({ author: author.id });
      }
      return await Book.find({});
    },
    allAuthors: async () => await Author.find({}),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Book: {
    author: async (root) => {
      return await Author.findById(root.author);
    },
  },
  User: {
    recommend: async (root) => {
      const books = await Book.find({ genres: root.favoriteGenre });
      return books;
    },
  },
  Mutation: {
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      let existingAuthor = await Author.findOne({ name: args.author });
      if (!existingAuthor) {
        const newAuthor = new Author({
          name: args.author,
          born: null,
        });
        try {
          existingAuthor = await newAuthor.save();
        } catch (error) {
          throw new GraphQLError("Saving auther failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.author,
              error,
            },
          });
        }
      }

      const newBook = {
        title: args.title,
        published: args.published,
        author: existingAuthor._id,
        genres: args.genres,
      };
      const book = new Book(newBook);
      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError("Saving book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
            error,
          },
        });
      }
      pubsub.publish("BOOK_ADDED", { bookAdded: book });
      return book;
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const author = await Author.findOne({ name: args.name });
      try {
        author.born = args.setBornTo;
        return await author.save();
      } catch (error) {
        if (!author) {
          throw new GraphQLError("No author found", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.setBornTo,
              error,
            },
          });
        }
        throw new GraphQLError("Saving auther failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.setBornTo,
            error,
          },
        });
      }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
  Author: {
    bookCount: async (root) =>
      await Book.find({ author: root.id }).countDocuments(),
  },
};
module.exports = resolvers;
