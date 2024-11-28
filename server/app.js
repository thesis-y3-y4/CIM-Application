require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.use(cors());
app.use(express.json());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Models
const userModel = require("./models/user");
const announcementModel = require("./models/announcements");
const eventModel = require("./models/events");
const mobileUserModel = require("./models/mobileUser");
const userReactionModel = require("./models/userReaction");
const communityModel = require("./models/community");
const postCommentsModel = require("./models/postcomments");
const forumPostModel = require("./models/forumPost");
const forumUserReactionModel = require("./models/forumUserReaction");
const minigameModel = require("./models/minigame");
const friendRequestModel = require("./models/friendRequest");
const friendsModel = require("./models/friends");
const minigameShopItemModel = require("./models/minigameshopitems");
const organizationModel = require("./models/organization");

//Middleware
const authenticateToken = require("./middleware/auth");

const mongoUrl = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

app.use("/assets", express.static(__dirname + "client/assets"));

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Database connection failed: \n", err);
  });

if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname + "client/build"));
  console.log("Server is running in production mode");
} else {
  app.use(express.static(__dirname + "client/build"));
  console.log("Server is running in development mode");
}

const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://thesis-cim-23.onrender.com",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });

  socket.on("sendNotification", (notification) => {
    io.emit("notification", notification);
  });
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

// Define a route for the root to prevent "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Backend server is up and running!");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post("/login-user", async (req, res) => {
  const { studentemail, password } = req.body;

  try {
    let user = await mobileUserModel.findOne({ studentemail });
    let userType = "userType";

    if (!user) {
      user = await userModel.findOne({ studentemail });
      userType = "adminType";
    }

    if (!user) {
      return res
        .status(401)
        .send({ status: "Error", message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .send({ status: "error", message: "Invalid password" });
    }

    // Check if there's already an active session for another device (Device 1)
    const currentSessionToken = user.currentSessionToken;
    if (currentSessionToken) {
      // Invalidate the session for Device 1 (could be done by deleting the token or updating it to null)
      await mobileUserModel.updateOne(
        { studentemail },
        { $set: { currentSessionToken: null } }
      );
    }

    // Generate a new token for Device 2
    const token = jwt.sign(
      { id: user._id, studentemail: user.studentemail },
      JWT_SECRET
    );

    // Store the new token in the database
    await mobileUserModel.updateOne(
      { studentemail },
      { $set: { currentSessionToken: token } }
    );

    // Respond with the new token
    return res.status(200).send({
      status: "ok",
      data: `Bearer ${token}`,
      [userType]: user[userType],
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: "error", message: "Internal server error" });
  }
});

app.post("/logout-user", authenticateToken, async (req, res) => {
  const { studentemail } = req.body;

  try {
    // Try to find the user in mobileUserModel first and nullify the session token
    const mobileUser = await mobileUserModel.findOne({ studentemail });

    if (mobileUser) {
      await mobileUserModel.updateOne(
        { studentemail },
        { $set: { currentSessionToken: null } }
      );
      console.log(`Session token nullified for mobileUser: ${studentemail}`);
    } else {
      // If not found in mobileUserModel, search in userModel
      const user = await userModel.findOne({ studentemail });

      if (user) {
        await userModel.updateOne(
          { studentemail },
          { $set: { currentSessionToken: null } }
        );
        console.log(`Session token nullified for userModel: ${studentemail}`);
      } else {
        return res.status(404).send({
          status: "error",
          message: "User not found in both models.",
        });
      }
    }

    return res
      .status(200)
      .send({ status: "ok", message: "Logged out successfully." });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.post("/userdata", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const studentemail = user.studentemail;

    let userData = await mobileUserModel.findOne({ studentemail });
    if (!userData) {
      userData = await userModel.findOne({ studentemail });
    }
    return res.status(200).send({ status: "Ok", data: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
});

// HomeScreen
app.post("/announcedata", async (req, res) => {
  try {
    const announcements = await announcementModel
      .find({ status: "approved", expirationDate: { $gte: Date.now() } })
      .populate("postedBy", "name profilePicture")
      .exec();

    io.emit("announcement", announcements);
    res.status(200).send({ status: "success", announcements });
  } catch (error) {
    return res.send({ error: error });
  }
});

// ProfileScreen
app.post("/updateprofilepicture", authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.user.id;

    console.log("Profile picture URL:", url);
    console.log("User ID:", userId);

    let user = await mobileUserModel.findById(userId);
    if (!user) {
      user = await userModel.findOne({ _id: userId });

      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
    }

    user.profilePicture = url;
    await user.save();

    res.status(200).send({ status: "success", data: user });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.post("/getprofilepicture", async (req, res) => {
  const { studentemail } = req.body;

  try {
    let user = await mobileUserModel.findOne({ studentemail });
    if (!user) {
      user = await userModel.findOne({ studentemail });
    }

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send({ status: "success", data: user.profilePicture });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

//For Events in Calendar
app.post("/events", async (req, res) => {
  const { token } = req.body;
  try {
    const events = await eventModel.find({});
    res.status(200).send({ status: "SUCCESS", events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "An error occurred while fetching events" });
  }
});

//For Reaction in Announcements
app.post("/reactsdata", authenticateToken, async (req, res) => {
  const { announcementId, reaction, userId } = req.body;

  if (!announcementId || !reaction || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let existingReaction = await userReactionModel.findOne({
      userId,
      announcementId,
    });

    let announcement = await announcementModel.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    if (existingReaction) {
      if (existingReaction.reaction === "like") {
        announcement.likes--;
      } else if (existingReaction.reaction === "dislike") {
        announcement.dislikes--;
      }

      existingReaction.reaction = reaction;
      existingReaction.dateReacted = new Date();
      await existingReaction.save();
    } else {
      existingReaction = new userReactionModel({
        userId,
        announcementId,
        reaction,
        dateReacted: new Date(),
      });
      await existingReaction.save();
    }

    if (reaction === "like") {
      announcement.likes += 1;
    } else if (reaction === "dislike") {
      announcement.dislikes += 1;
    }

    await announcement.save();
    console.log("Reaction Announcement saved successfully: ", existingReaction);
    res.status(200).json({ announcement });
  } catch (error) {
    console.error("Error handling reaction:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/getreactsdata", async (req, res) => {
  try {
    const events = await userReactionModel.find({});
    res.status(200).send({ status: "SUCCESS", events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "An error occurred while fetching events" });
  }
});

// CommunitiesScreen
app.post("/getcommunities", async (req, res) => {
  const { token } = req.body;
  try {
    const communities = await communityModel.find({});
    res.status(200).send({ status: "SUCCESS", communities });
  } catch (error) {
    console.error("Error fetching communities:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching communities" });
  }
});

// User's communities - CommunitiesScreen
app.post("/usercommunityposts", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const communities = await communityModel.find({ "members.userId": userId });
    if (communities.length === 0) {
      return res
        .status(404)
        .send({ error: "No communities found for this user" });
    }

    const communityIds = communities.map((community) => community._id);

    const announcements = await announcementModel.find({
      communityId: { $in: communityIds },
      status: "approved",
    });

    res.status(200).send({
      status: "success",
      announcements: announcements,
    });
  } catch (error) {
    console.error("Error fetching announcements for user communities:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.get("/ismembercommunity/:communityId/:userId", async (req, res) => {
  const { communityId, userId } = req.params;

  try {
    const community = await communityModel.findById(communityId);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Check if userId is in the members list
    const isMember = community.members.some(
      (member) => member.userId.toString() === userId
    );

    return res.json({ isMember });
  } catch (error) {
    console.error("Error checking membership:", error);
    res.status(500).json({ error: "Server error" });
  }
});

//Get a specific community - CommunityDetailsScreen
app.post("/getcommunity/:communityId", async (req, res) => {
  const { communityId } = req.params;

  try {
    const community = await communityModel.findById(communityId);
    if (!community) {
      return res.status(404).send({ error: "Community not found" });
    }

    res.status(200).send({ status: "success", community });
  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

//Get community posts from a specific community
app.post("/communityposts/:communityId", async (req, res) => {
  const { communityId } = req.params;

  try {
    const posts = await announcementModel.find({
      communityId,
      status: "approved",
    });

    console.log(
      `Fetched COMMUNITY posts: ${JSON.stringify(
        posts.length
      )} from - ${communityId}`
    );

    res.status(200).send({ status: "success", posts });
  } catch (error) {
    console.error("Error fetching community posts:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

//Get forum posts from a specific community
app.get("/communityforumposts/:communityId", async (req, res) => {
  try {
    const { communityId } = req.params;

    const forumPosts = await forumPostModel
      .find({ communityId })
      .sort({ datePosted: -1 });

    res.status(200).send({ status: "success fetch forum posts", forumPosts });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// CreatePostScreen
app.post("/createforumpost", authenticateToken, async (req, res) => {
  console.log("Incoming post data:", req.body);
  try {
    const { header, body, communityId, mediaURL } = req.body;
    const userId = req.user.id;

    if (!header || !body || !communityId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newPost = new forumPostModel({
      postedBy: userId,
      communityId,
      header,
      body,
      mediaURL,
      datePosted: new Date(),
    });

    await newPost.save();
    console.log("Post created:", newPost);
    return res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error); // Log detailed error
    return res
      .status(500)
      .json({ message: "Error creating post", error: error.message }); // Send back the error message
  }
});

// CommunityDetailsScreen
app.post("/forumreactsdata", authenticateToken, async (req, res) => {
  const { forumPostId, reaction, userId } = req.body;

  if (!forumPostId || !reaction || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let existingReaction = await forumUserReactionModel.findOne({
      userId,
      forumPostId,
    });

    let forumPost = await forumPostModel.findById(forumPostId);

    if (!forumPost) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    if (existingReaction) {
      if (existingReaction.reaction === "like") {
        forumPost.likes--;
      } else if (existingReaction.reaction === "dislike") {
        forumPost.dislikes--;
      }

      existingReaction.reaction = reaction;
      existingReaction.dateReacted = new Date();
      await existingReaction.save();
    } else {
      existingReaction = new forumUserReactionModel({
        userId,
        forumPostId,
        reaction,
        dateReacted: new Date(),
      });
      await existingReaction.save();
    }

    if (reaction === "like") {
      forumPost.likes += 1;
    } else if (reaction === "dislike") {
      forumPost.dislikes += 1;
    }

    await forumPost.save();
    console.log("Forum post reaction saved:", existingReaction);

    res.status(200).json({ forumPost });
  } catch (error) {
    console.error("Error handling forum reaction:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/getforumreactsdata/:communityId", async (req, res) => {
  const { communityId } = req.params;

  try {
    const forumPosts = await forumPostModel.find({ communityId });

    const reactions = await forumUserReactionModel.find({
      forumPostId: { $in: forumPosts.map((post) => post._id) },
    });

    return res.status(200).json({ success: true, reactions });
  } catch (error) {
    console.error("Error fetching forum reactions:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

app.post("/addcomment", authenticateToken, async (req, res) => {
  const { postId, postType, text } = req.body;
  const userId = req.user.id;

  if (!postId || !postType || !text) {
    return res.status(400).send({
      status: "error",
      message: "Missing post ID, post type, or text",
    });
  }

  try {
    const newComment = new postCommentsModel({
      postId,
      postType, // Either "announcement" or "forumPost"
      userId,
      text,
    });

    await newComment.save();

    res.status(201).send({ status: "success", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send({ status: "error", message: "Internal server error" });
  }
});

app.get("/fetchcomments/:postId/:postType", async (req, res) => {
  const { postId, postType } = req.params;

  try {
    const comments = await postCommentsModel
      .find({ postId, postType })
      .sort({ createdAt: -1 });

    res.status(200).send({ status: "success", comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send({ status: "error", message: "Internal server error" });
  }
});

app.get(
  "/commentscount/:postId/announcement",
  authenticateToken,
  async (req, res) => {
    const { postId } = req.params;
    try {
      const commentsCount = await postCommentsModel.countDocuments({
        postId,
        postType: "announcement",
      });
      res.status(200).json({ count });
    } catch (error) {
      console.error("Error fetching comments count:", error);
      res
        .status(500)
        .send({ status: "error", message: "Internal server error" });
    }
  }
);

//Get MinigameWord -  AnnouncementPost
app.post("/announcedata/:announcementId", async (req, res) => {
  try {
    const announcement = await announcementModel
      .findOne({
        _id: req.params.announcementId,
        status: "approved",
        expirationDate: { $gte: Date.now() },
      })
      .populate("postedBy", "name profilePicture")
      .exec();

    if (!announcement) {
      return res.status(404).send({ error: "Announcement not found" });
    }
    // Emit the announcement to any connected clients
    io.emit("announcement", announcement);

    // Check if the announcement has a minigameWord field
    const minigameWord = announcement.minigameWord || null;
    res.status(200).send({ status: "success", announcement, minigameWord });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// POST endpoint to create a new minigame entry
app.post("/playminigame", authenticateToken, async (req, res) => {
  const { announcementId, game, result, stats } = req.body;
  const userId = req.user.id;

  if (!announcementId || !game || !result || !stats) {
    return res.status(400).send({
      status: "error",
      message: "Missing announcement ID, game type, or result",
    });
  }

  let gameStats = {};

  if (game === "CIM Wordle" && stats.CIMWordle) {
    gameStats = {
      result,
      points: stats.points || 0,
      CIMWordle: {
        guesses: stats.CIMWordle.guesses || 0,
      },
    };
  } else if (game === "Flappy CIM" && stats.FlappyCIM) {
    gameStats = {
      result,
      points: stats.points || 0,
      FlappyCIM: {
        tries: stats.FlappyCIM.tries || 0,
      },
    };
  } else {
    gameStats = {
      result,
      points: stats ? stats.points || 0 : 0,
    };
  }

  try {
    // Create the new minigame entry
    const newMinigame = new minigameModel({
      announcementId,
      userId,
      game,
      playedAt: Date.now(),
      stats: gameStats,
    });

    await newMinigame.save();

    // Update the user's claw marks based on the stats
    const user = await userModel.findById(userId);
    const mobileUser = user ? null : await mobileUserModel.findById(userId);

    if (user) {
      await userModel.findByIdAndUpdate(userId, {
        $inc: { clawMarks: stats.points },
      });
    } else if (mobileUser) {
      await mobileUserModel.findByIdAndUpdate(userId, {
        $inc: { clawMarks: stats.points },
      });
    } else {
      return res.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    res.status(201).send({ status: "success", minigame: newMinigame });
  } catch (error) {
    console.error("Error saving minigame entry:", error);
    res.status(500).send({ status: "error", message: "Internal server error" });
    if (error.response) {
      console.error("Response error:", error.response);
    } else {
      console.error("Request error:", error.message);
    }
  }
});

// MinigameScreen
app.get("/cimdle-stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const games = await minigameModel.find({ userId });

    const gamesPlayed = games.length;
    const wins = games.filter((game) => game.stats.result === "win").length;
    const lose = games.filter((game) => game.stats.result === "lose").length;

    const winPercentage = gamesPlayed
      ? Math.round((wins / gamesPlayed) * 100)
      : 0;

    const guessesForCIMWordle = games
      .filter(
        (game) => game.game === "CIM Wordle" && game.stats.CIMWordle.guesses
      )
      .map((game) => game.stats.CIMWordle.guesses);

    const averageGuesses = guessesForCIMWordle.length
      ? (
          guessesForCIMWordle.reduce((a, b) => a + b, 0) /
          guessesForCIMWordle.length
        ).toFixed(2)
      : "0.00";

    res.json({
      gamesPlayed,
      wins,
      lose,
      winPercentage,
      averageGuesses,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch minigame stats" });
  }
});
app.get("/flappycim-stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const games = await minigameModel.find({ userId, game: "Flappy CIM" });

    const gamesPlayed = games.length;
    const wins = games.filter((game) => game.stats.result === "win").length;
    const lose = games.filter((game) => game.stats.result === "lose").length;

    const winPercentage = gamesPlayed
      ? Math.round((wins / gamesPlayed) * 100)
      : 0;

    // Get the number of tries for each "Flappy CIM" game
    const triesForFlappyCIM = games
      .filter(
        (game) => game.game === "Flappy CIM" && game.stats.FlappyCIM.tries
      )
      .map((game) => game.stats.FlappyCIM.tries);

    // Calculate the average tries
    const averageTries = triesForFlappyCIM.length
      ? (
          triesForFlappyCIM.reduce((a, b) => a + b, 0) /
          triesForFlappyCIM.length
        ).toFixed(2)
      : "0.00";

    // Respond with the calculated statistics
    res.json({
      gamesPlayed,
      wins,
      lose,
      winPercentage,
      averageTries,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch Flappy CIM stats",
      message: error.message,
    });
  }
});

// MinigameScreen: Check if a user has played a game
app.get(
  "/hasPlayedGame/:announcementId",
  authenticateToken,
  async (req, res) => {
    const { announcementId } = req.params;
    const userId = req.user.id;

    try {
      const gameRecord = await minigameModel.findOne({
        announcementId,
        userId,
      });
      if (gameRecord) {
        return res.status(200).json({ hasPlayed: true });
      } else {
        return res.status(200).json({ hasPlayed: false });
      }
    } catch (error) {
      console.error("Error checking game record:", error);
      res
        .status(500)
        .send({ status: "error", message: "Internal server error" });
    }
  }
);

app.post("/sendfriendrequest", authenticateToken, async (req, res) => {
  const { recipientId, requesterId } = req.body;

  try {
    // Check if there's already a friendship or request between these users
    const existingRequest = await friendRequestModel.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Friend request already exists." });
    }

    // Create a new friend request
    const friendRequest = new friendRequestModel({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });

    await friendRequest.save();
    console.log("Friend request sent:", friendRequest);
    res.status(201).json({
      message: "Friend request sent successfully.",
      friendRequest,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Friend request validation failed",
        errors: error.errors,
      });
    }
    res.status(500).json({
      message: "An error occurred while sending the friend request.",
      error: error.message,
    });
  }
});

app.post("/respondfriendrequest", authenticateToken, async (req, res) => {
  const { requestId, action } = req.body;

  try {
    const friendRequest = await friendRequestModel.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    if (friendRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Friend request has already been responded to." });
    }

    if (action === "accept") {
      friendRequest.status = "accepted";
      await friendRequest.save();

      const newFriendship = new friendsModel({
        user1: friendRequest.requester,
        user2: friendRequest.recipient,
        friendsSince: new Date(),
      });
      await newFriendship.save();

      return res.status(200).json({
        message: "Friend request accepted and friendship created successfully.",
        friendRequest,
        friendship: newFriendship,
      });
    } else if (action === "reject") {
      // Update status to rejected
      friendRequest.status = "rejected";
      await friendRequest.save();

      // Delete the friend request from the database
      await friendRequestModel.findByIdAndDelete(requestId);

      return res.status(200).json({
        message: "Friend request rejected and deleted successfully.",
      });
    } else {
      return res.status(400).json({ message: "Invalid action provided." });
    }
  } catch (error) {
    console.error("Error responding to friend request:", error);
    res.status(500).json({
      message: "An error occurred while responding to the friend request.",
      error: error.message,
    });
  }
});

//Get all friend requests as recipient
app.get(
  "/friendrequests/recipient/:userId",
  authenticateToken,
  async (req, res) => {
    const { userId } = req.params;

    try {
      const friendRequests = await friendRequestModel.find({
        recipient: userId,
        status: "pending",
      });

      // Populate requester and recipient manually
      const populatedRequests = await Promise.all(
        friendRequests.map(async (request) => {
          // Populate requester
          if (await userModel.exists({ _id: request.requester })) {
            request.requester = await userModel.findById(request.requester);
          } else if (await mobileUserModel.exists({ _id: request.requester })) {
            request.requester = await mobileUserModel.findById(
              request.requester
            );
          }
          return request;
        })
      );

      res.status(200).json(populatedRequests);
    } catch (error) {
      console.error("Error retrieving friend requests as recipient:", error);
      res.status(500).json({
        message: "An error occurred while retrieving friend requests.",
        error: error.message,
      });
    }
  }
);

//Get all friend requests as requester
app.get(
  "/friendrequests/requester/:userId",
  authenticateToken,
  async (req, res) => {
    const { userId } = req.params;

    try {
      // Retrieve friend requests made by the requester
      const friendRequests = await friendRequestModel.find({
        requester: userId,
      });

      // Populate requester and recipient manually
      const populatedRequests = await Promise.all(
        friendRequests.map(async (request) => {
          // Populate requester
          let requester;
          if (await userModel.exists({ _id: request.requester })) {
            requester = await userModel.findById(request.requester);
          } else if (await mobileUserModel.exists({ _id: request.requester })) {
            requester = await mobileUserModel.findById(request.requester);
          }

          // Populate recipient
          let recipient;
          if (await userModel.exists({ _id: request.recipient })) {
            recipient = await userModel.findById(request.recipient);
          } else if (await mobileUserModel.exists({ _id: request.recipient })) {
            recipient = await mobileUserModel.findById(request.recipient);
          }

          // Return the request with populated fields
          return {
            ...request.toObject(), // Convert to plain object
            requester,
            recipient,
          };
        })
      );

      res.status(200).json(populatedRequests);
    } catch (error) {
      console.error("Error retrieving friend requests as requester:", error);
      res.status(500).json({
        message: "An error occurred while retrieving friend requests.",
        error: error.message,
      });
    }
  }
);

//Get all friends
app.get("/friendslist/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all friendships where the user is either user1 or user2
    const friends = await friendsModel.find({
      $or: [{ user1: userId }, { user2: userId }],
    });

    // Populate user information for both user1 and user2 and filter out the logged-in user
    const populatedFriends = await Promise.all(
      friends.map(async (friendship) => {
        const user1 =
          (await userModel.findById(friendship.user1)) ||
          (await mobileUserModel.findById(friendship.user1));
        const user2 =
          (await userModel.findById(friendship.user2)) ||
          (await mobileUserModel.findById(friendship.user2));

        // Determine which user is the friend (not the requester)
        const friend = user1._id.toString() === userId ? user2 : user1;

        return {
          friend,
          friendsSince: friendship.friendsSince,
        };
      })
    );

    res.status(200).json(populatedFriends);
  } catch (error) {
    console.error("Error retrieving friends:", error);
    res.status(500).json({
      message: "An error occurred while retrieving friends.",
      error: error.message,
    });
  }
});

//Forum Posts - Friend Status
app.get(
  "/friendstatus/:userId/:friendId",
  authenticateToken,
  async (req, res) => {
    const { userId, friendId } = req.params;

    try {
      // Check for existing friend request
      const friendRequest = await friendRequestModel.findOne({
        $or: [
          { requester: userId, recipient: friendId },
          { requester: friendId, recipient: userId },
        ],
      });

      // Check if they are friends (you might have a friends model)
      const areFriends = await friendsModel.findOne({
        $or: [
          { user1: userId, user2: friendId },
          { user1: friendId, user2: userId },
        ],
      });

      res.status(200).json({
        areFriends: !!areFriends,
        isPending: friendRequest && friendRequest.status === "pending",
      });
    } catch (error) {
      console.error("Error checking friend status:", error);
      res.status(500).json({
        message: "An error occurred while checking the friend status.",
        error: error.message,
      });
    }
  }
);

//Get a specific friend's profile
app.get("/frienddata/:friendId", authenticateToken, async (req, res) => {
  const { friendId } = req.params;
  try {
    // Attempt to find the user in the mobile user or main user model
    let friendData = await mobileUserModel.findById(friendId);
    if (!friendData) {
      friendData = await userModel.findById(friendId);
    }

    if (!friendData) {
      return res
        .status(404)
        .send({ status: "Error", message: "User not found" });
    }

    return res.status(200).send({ status: "Ok", data: friendData });
  } catch (error) {
    console.error("Error fetching friend's data:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
});

//Fetch all minigameshopitem
app.get("/minigameshopitems", async (req, res) => {
  try {
    const items = await minigameShopItemModel.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});

//Purchase minigameshopitem
app.post(
  "/purchase-minigameshopitem/:user_id",
  authenticateToken,
  async (req, res) => {
    try {
      const { shopItemId } = req.body;
      const user_id = req.params.user_id;

      // Find user in the user model or mobile user model
      let userDocument = await userModel.findById(user_id);
      if (!userDocument) {
        userDocument = await mobileUserModel.findById(user_id);
      }

      if (!userDocument) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find the shop item
      const item = await minigameShopItemModel.findById(shopItemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Check if the user has enough claw marks
      if (userDocument.clawMarks < item.price) {
        return res.status(400).json({ message: "Not enough claw marks" });
      }

      // Deduct claw marks and add item to purchasedShopItems
      userDocument.clawMarks -= item.price;
      userDocument.purchasedShopItems.push(item._id);

      // Save the updated user document
      await userDocument.save();

      res.status(200).json({
        message: "Item purchased successfully",
        clawMarks: userDocument.clawMarks,
      });
    } catch (error) {
      console.error(
        "Error purchasing minigame shop item for user",
        req.params.user_id,
        error
      );
      res.status(500).json({ message: "Error purchasing minigame shop item" });
    }
  }
);

//Get all of the user.purchasedShopItems or mobileUser.purchasedShopItems
app.get(
  "/purchased-minigameshopitems/:user_id",
  authenticateToken,
  async (req, res) => {
    try {
      const { user_id } = req.params;

      // First check for the regular user model
      let userDocument = await userModel
        .findById(user_id)
        .populate("purchasedShopItems");
      if (!userDocument) {
        // If not found, check the mobile user model
        userDocument = await mobileUserModel
          .findById(user_id)
          .populate("purchasedShopItems");
      }

      if (!userDocument) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return the populated items (with details)
      res.status(200).json(userDocument.purchasedShopItems);
    } catch (error) {
      console.error("Error fetching purchased minigame shop items:", error);
      res.status(500).json({ message: "Error fetching purchased items" });
    }
  }
);

//To update the user.selectedFrame || mobileUser.selectedFrame
app.post(
  "/update-selectedframe/:user_id",
  authenticateToken,
  async (req, res) => {
    try {
      const { user_id } = req.params;
      const { selectedFrame } = req.body;

      // First check for the regular user model
      let userDocument = await userModel.findById(user_id);
      if (!userDocument) {
        // If not found, check the mobile user model
        userDocument = await mobileUserModel.findById(user_id);
      }

      if (!userDocument) {
        return res.status(404).json({ message: "User not found" });
      }

      userDocument.selectedFrame = selectedFrame;
      await userDocument.save();

      res.status(200).json({ message: "Frame updated successfully" });
    } catch (error) {
      console.error("Error updating selected frame:", error);
      res.status(500).json({ message: "Error updating selected frame" });
    }
  }
);

app.get("/organizationannouncements/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await userModel.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const organizationName = user.organization;
    const organization = await mongoose
      .model("Organization")
      .findOne({ name: organizationName });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const announcements = await announcementModel.find({
      organizationId: organization._id,
    });

    if (announcements.length === 0) {
      return res
        .status(404)
        .json({ message: "No announcements found for this organization" });
    }

    // Send the found announcements
    res.status(200).json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
