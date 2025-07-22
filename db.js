import mongoose from "mongoose";

const MONGO_URI =
  "mongodb+srv://rocanacho08:7KFIhQON4SFwaDWW@cluster0.jd0yt5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export const connectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
  }
};
