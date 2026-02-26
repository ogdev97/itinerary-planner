export type Language = 'en' | 'zh';

export const translations = {
  en: {
    // Home Page
    title: "Smart Travel Agent",
    subtitle: "Your personal ocean of travel possibilities. Tell us where, when, and your vibe.",
    destinations: "DESTINATIONS & DATES",
    cityLabel: "CITY",
    fromLabel: "FROM",
    toLabel: "TO",
    addCityBtn: "Add Another City",
    vibeLabel: "VIBE / INTERESTS",
    vibePlaceholder: "e.g. Relaxing beach days, seafood dinners, sunset boat tours...",
    generateBtn: "Generate Ocean Escape",
    generating: "Calculating Routes...",
    finalizing: "Finalizing Itinerary...",
    searchPlaceholder: "e.g. Santorini, Greece",
    
    // Planner Page
    noCitiesTitle: "No cities added yet!",
    noCitiesSub: "Your adventure map is empty. Start by creating your first trip.",
    startNew: "Start New Adventure",
    exportPdf: "Export PDF",
    destinationsTitle: "DESTINATIONS",
    addDestSidebar: "Add Destination",
    days: "Days",
    day: "Day",
    noPlans: "No plans yet. Time to explore!",
    addActivity: "Add Activity",
    totalBudget: "Total Budget", // Kept for legacy compatibility if re-added
    
    // Add Item Modal
    addItemTitle: "Add New Item",
    itemTitleLabel: "TITLE",
    itemTitlePlaceholder: "e.g. Visit Museum",
    itemTypeLabel: "TYPE",
    itemNotesLabel: "NOTES",
    cancelBtn: "Cancel",
    confirmBtn: "Add Item",
    
    // Item Types
    types: {
      ACTIVITY: "Activity",
      HOTEL: "Hotel",
      FOOD: "Food",
      TRANSPORT: "Transport"
    },

    // AI Prompt Instruction (internal use)
    aiInstruction: "Respond in English."
  },
  zh: {
    // Home Page
    title: "智能旅行助手",
    subtitle: "您的私人旅行规划专家。告诉我们要去哪里、时间和您的喜好。",
    destinations: "目的地与日期",
    cityLabel: "城市",
    fromLabel: "出发",
    toLabel: "返回",
    addCityBtn: "添加更多城市",
    vibeLabel: "旅行风格 / 兴趣",
    vibePlaceholder: "例如：轻松的海滩度假，海鲜大餐，日落游船...",
    generateBtn: "生成行程",
    generating: "正在规划路线...",
    finalizing: "正在完善行程...",
    searchPlaceholder: "例如：东京, 日本",
    
    // Planner Page
    noCitiesTitle: "尚未添加城市！",
    noCitiesSub: "您的冒险地图是空的。开始创建您的第一次旅行吧。",
    startNew: "开始新旅程",
    exportPdf: "导出 PDF",
    destinationsTitle: "目的地",
    addDestSidebar: "添加目的地",
    days: "天",
    day: "第", // Special handling for "Day X" -> "第 X 天" might be needed, or just "第X天"
    daySuffix: "天",
    noPlans: "暂无计划。去探索吧！",
    addActivity: "添加活动",
    totalBudget: "总预算",
    
    // Add Item Modal
    addItemTitle: "添加新项目",
    itemTitleLabel: "标题",
    itemTitlePlaceholder: "例如：参观博物馆",
    itemTypeLabel: "类型",
    itemNotesLabel: "备注",
    cancelBtn: "取消",
    confirmBtn: "添加",
    
    // Item Types
    types: {
      ACTIVITY: "活动",
      HOTEL: "酒店",
      FOOD: "餐饮",
      TRANSPORT: "交通"
    },

    // AI Prompt Instruction
    aiInstruction: "Respond in Simplified Chinese (简体中文). Use Chinese characters for names and descriptions."
  }
};
