import { CloudinaryStorage, OptionCallback, Options } from "multer-storage-cloudinary";

const cloudinary = require("cloudinary").v2;
var randomstring = require("randomstring");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

declare interface cloudinaryOptions extends Options {
  params: {
    folder: string;
    public_id: OptionCallback<string> | undefined;
    transformation?: { width: number; height: number; crop: string; quality: string }[];
  };
}

const multerAvatarOpts: cloudinaryOptions = {
  cloudinary: cloudinary,
  params: {
    folder: "avatar",
    public_id: (req, file) => "avatar_" + req.user!.username,
    transformation: [{ width: 300, height: 300, crop: "limit", quality: "auto" }],

  },
};

const multerLogoOpts: cloudinaryOptions = {
  cloudinary: cloudinary,
  params: {
    folder: "logo",
    public_id: (req, file) => "logo_" + req.params["communityName"],
    transformation: [{ width: 300, height: 300, crop: "limit", quality: "auto" }],

  },
};

const multerBannerOpts: cloudinaryOptions = {
  cloudinary: cloudinary,
  params: {
    folder: "banner",
    public_id: (req, file) => "banner_" + req.params["communityName"],
    transformation: [{ width: 300, height: 300, crop: "limit", quality: "auto" }],

  },
};

const postMediaOpts: cloudinaryOptions = {
  cloudinary: cloudinary,
  params: {
    folder: "posts",
    public_id: (req, file) => "post_" + randomstring.generate(10),
    transformation: [{ width: 300, height: 300, crop: "limit", quality: "auto" }],

  },
};

const chatMediaOpts: cloudinaryOptions = {
  cloudinary: cloudinary,
  params: {
    folder: "chat_images",
    public_id: (req, file) => "chat_image_" + randomstring.generate(10),
    transformation: [{ width: 300, height: 300, crop: "limit", quality: "auto" }],
  },
};

const chatChannelAvatarOpts: cloudinaryOptions = {
  cloudinary: cloudinary,
  params: {
    folder: "channels",
    public_id: (req, file) => "avt_" + randomstring.generate(10),
    transformation: [{ width: 300, height: 300, crop: "limit", quality: "auto" }],
  },
};

export const storage = {
  avatarStorage: new CloudinaryStorage(multerAvatarOpts),
  logoStorage: new CloudinaryStorage(multerLogoOpts),
  bannerStorage: new CloudinaryStorage(multerBannerOpts),
  postMediaStorage: new CloudinaryStorage(postMediaOpts),
  chatMediaStorage: new CloudinaryStorage(chatMediaOpts),
  chatChannelAvatarStorage: new CloudinaryStorage(chatChannelAvatarOpts),
};
