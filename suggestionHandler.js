module.exports = function(socket) {
  socket.on("suggestion", async (contact, suggestion) => {
    function hookEmbedSend(username, content, title, color) {
      const webhook = require("webhook-discord");
      const Hook = new webhook.Webhook(process.env['WEBHOOK_LINK']);
      
      return new Promise(resolve => {
        Hook.custom(username, content, title, color);
    
        setTimeout(() => {
          resolve();
        }, 2000);
      });
    }
    
    if (suggestion.length > 900) {
      var part = 1;

      while (suggestion.length > 900) {
        await hookEmbedSend(
          "SpeedMath Suggestion",
          `**Contact:**\n ${contact}\n\n\n**Suggestion:**\n ${suggestion.substring(0, 900)} **(Part ${part})**`,
          "New Suggestion",
          "#e33e32"
        );
        suggestion = suggestion.substring(900, suggestion.length);
        part++;
      }
    
      hookEmbedSend(
        "SpeedMath Suggestion",
        `**Contact:**\n ${contact}\n\n\n**Suggestion:**\n ${suggestion} **(Part ${part})**`,
        "New Suggestion",
        "#e33e32"
      );
    } else {
      hookEmbedSend(
        "SpeedMath Suggestion",
        `**Contact:**\n ${contact}\n\n\n**Suggestion:**\n ${suggestion}`,
        "New Suggestion",
        "#e33e32"
      );
    }
  });
}