const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "imgen",
    version: "1.0.0",
    role: 0,
    hasPrefix: true,
    credits: "bryson",
    description: "Generate AI images using various models",
    cooldowns: 10,
    category: "image",
    usages: "imgen [prompt] | [model]"
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    
    if (!args[0]) {
        return api.sendMessage(
            "🎨 𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥\n━━━━━━━━━━━━━━━━━━\n\n📝 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝗽𝗿𝗼𝗺𝗽𝘁\n\n💡 𝗨𝘀𝗮𝗴𝗲:\nimgen cute cat\nimgen beautiful landscape | nanobanana\nimgen fantasy castle | flux\n\n🛠️ 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗠𝗼𝗱𝗲𝗹𝘀:\n• nanobanana (default)\n• flux\n• prodia\n• dall-e\n• midjourney\n\n━━━━━━━━━━━━━━━━━━\n✨ 𝗔𝗜 𝗜𝗺𝗮𝗴𝗲 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻",
            threadID,
            messageID
        );
    }

    let prompt = args.join(" ");
    let model = "nanobanana"; // default model

    // Check if user specified a model using | separator
    if (prompt.includes(' | ')) {
        const parts = prompt.split(' | ');
        prompt = parts[0].trim();
        model = parts[1].trim().toLowerCase();
    }

    // Send waiting message
    const waitingMessage = await api.sendMessage(
        "⏳ 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗜𝗺𝗮𝗴𝗲\n━━━━━━━━━━━━━━━━━━\n\n🎨 𝗣𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝗽𝗿𝗼𝗺𝗽𝘁...\n🤖 𝗨𝘀𝗶𝗻𝗴 𝗺𝗼𝗱𝗲𝗹: " + model + "\n✨ 𝗖𝗿𝗲𝗮𝘁𝗶𝗻𝗴 𝗔𝗜 𝗮𝗿𝘁𝘄𝗼𝗿𝗸...\n\n━━━━━━━━━━━━━━━━━━\n🔄 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁, 𝘁𝗵𝗶𝘀 𝗺𝗮𝘆 𝘁𝗮𝗸𝗲 𝗮 𝗺𝗼𝗺𝗲𝗻𝘁",
        threadID
    );

    try {
        const apiUrl = `https://api-library-kohi.onrender.com/api/imagegen?prompt=${encodeURIComponent(prompt)}&model=${model}`;
        
        console.log(`🔄 Generating image with: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, {
            responseType: 'stream',
            timeout: 60000, // 60 seconds timeout for image generation
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Delete waiting message
        api.unsendMessage(waitingMessage.messageID);

        const fileName = `imgen_${Date.now()}.jpg`;
        const filePath = path.join(__dirname, fileName);

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🎨 𝗔𝗜 𝗜𝗺𝗮𝗴𝗲 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱\n━━━━━━━━━━━━━━━━━━\n\n📝 𝗣𝗿𝗼𝗺𝗽𝘁: "${prompt}"\n🤖 𝗠𝗼𝗱𝗲𝗹: ${model}\n✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗰𝗿𝗲𝗮𝘁𝗲𝗱!\n\n━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝗜 | 𝗯𝘆 𝗯𝗿𝘆𝘀𝗼𝗻`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                try {
                    fs.unlinkSync(filePath); // Cleanup
                } catch (e) {
                    console.error("Error deleting file:", e);
                }
            }, messageID);
        });

        writer.on('error', (error) => {
            console.error("Download error:", error);
            api.unsendMessage(waitingMessage.messageID);
            api.sendMessage(
                "❌ 𝗘𝗿𝗿𝗼𝗿 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗜𝗺𝗮𝗴𝗲\n━━━━━━━━━━━━━━━━━━\n\n🚫 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝗶𝗺𝗮𝗴𝗲\n🔧 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿\n\n━━━━━━━━━━━━━━━━━━\n💫 𝗦𝗼𝗿𝗿𝘆 𝗳𝗼𝗿 𝘁𝗵𝗲 𝗶𝗻𝗰𝗼𝗻𝘃𝗲𝗻𝗶𝗲𝗻𝗰𝗲",
                threadID,
                messageID
            );
        });

    } catch (error) {
        console.error('Image Generation API Error:', error.response?.data || error.message);
        
        api.unsendMessage(waitingMessage.messageID);
        
        let errorMessage = "";
        
        if (error.code === 'ECONNREFUSED') {
            errorMessage = "🌐 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗼𝗻 𝗙𝗮𝗶𝗹𝗲𝗱\n━━━━━━━━━━━━━━━━━━\n\n🚫 𝗖𝗮𝗻𝗻𝗼𝘁 𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝘁𝗼 𝗔𝗜 𝗔𝗣𝗜\n🔧 𝗔𝗣𝗜 𝘀𝗲𝗿𝘃𝗲𝗿 𝗺𝗶𝗴𝗵𝘁 𝗯𝗲 𝗱𝗼𝘄𝗻\n\n━━━━━━━━━━━━━━━━━━\n🔄 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿";
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = "⏰ 𝗧𝗶𝗺𝗲𝗼𝘂𝘁 𝗘𝗿𝗿𝗼𝗿\n━━━━━━━━━━━━━━━━━━\n\n⏳ 𝗜𝗺𝗮𝗴𝗲 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻 𝘁𝗼𝗼𝗸 𝘁𝗼𝗼 𝗹𝗼𝗻𝗴\n💡 𝗧𝗿𝘆 𝗮 𝘀𝗶𝗺𝗽𝗹𝗲𝗿 𝗽𝗿𝗼𝗺𝗽𝘁\n\n━━━━━━━━━━━━━━━━━━\n⚡ 𝗥𝗲𝘁𝗿𝘆 𝗶𝗻 𝟯𝟬𝘀";
        } else if (error.response?.status === 404) {
            errorMessage = "⚠️ 𝗠𝗼𝗱𝗲𝗹 𝗡𝗼𝘁 𝗙𝗼𝘂𝗻𝗱\n━━━━━━━━━━━━━━━━━━\n\n🔧 𝗠𝗼𝗱𝗲𝗹 '${model}' 𝗶𝘀 𝗻𝗼𝘁 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲\n💡 𝗧𝗿𝘆: nanobanana, flux, prodia\n\n━━━━━━━━━━━━━━━━━━\n✨ 𝗨𝘀𝗶𝗻𝗴 𝗱𝗲𝗳𝗮𝘂𝗹𝘁 𝗺𝗼𝗱𝗲𝗹";
        } else {
            errorMessage = "🚫 𝗦𝗲𝗿𝘃𝗶𝗰𝗲 𝗨𝗻𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲\n━━━━━━━━━━━━━━━━━━\n\n🔧 𝗔𝗜 𝗶𝗺𝗮𝗴𝗲 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻 𝗳𝗮𝗶𝗹𝗲𝗱\n🔄 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗶𝗻 𝗮 𝗳𝗲𝘄 𝗺𝗶𝗻𝘂𝘁𝗲𝘀\n\n━━━━━━━━━━━━━━━━━━\n💫 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘆𝗼𝘂𝗿 𝗽𝗮𝘁𝗶𝗲𝗻𝗰𝗲";
        }
        
        return api.sendMessage(errorMessage, threadID, messageID);
    }
};
