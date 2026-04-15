import { asyncHandler } from "../../utils/async-handler.js";
import { getAssistantAdvice } from "../../services/ai/diet-assistant.service.js";

export const chatWithAssistant = asyncHandler(async (req, res) => {
  const data = await getAssistantAdvice(req.user.id, req.body.message);

  res.status(200).json({
    success: true,
    data,
  });
});
