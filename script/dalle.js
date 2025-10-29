const axios = require('axios');

module.exports.config = {
  name: "dalle",
  version: "1.0.0",
  credits: "bryson",
  description: "Generates 4 AI images using DALL·E from a given prompt.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["dalleimage", "genimage"],
};

module.exports.run = async function ({ api, event, args }) {
  if (!args || args.length === 0) {
    return api.sendMessage(
      "Please provide a prompt to generate DALL·E images.\n\nExample: dalle dog wearing sunglasses",
      event.threadID,
      event.messageID
    );
  }

  const prompt = args.join(' ');
  const imageUrl = `https://api-library-kohi.onrender.com/api/opendalle?prompt=${encodeURIComponent(prompt)}`;

  try {
    const imageStream = await axios.get(imageUrl, { responseType: 'stream' });

    return api.sendMessage({
      body: `Here are your 4 images for: "${prompt}"`,
      attachment: imageStream.data
    }, event.threadID);
  } catch (error) {
    console.error('DALL·E image generation error:', error.message);
    return api.sendMessage(
      "Error: DALL·E image request failed. Please try again.",
      event.threadID,
      event.messageID
    );
  }
};
