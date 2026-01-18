import { useAppStore } from "@/stores/app";
import { MessageSquare, Plus } from "lucide-react";

function SessionsPage() {
  const { currentTenant } = useAppStore();

  if (!currentTenant) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>请先选择一个租户</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Sidebar - Session List */}
      <div className="w-64 border-r border-[#3C3C3C] flex flex-col">
        <div className="p-3 border-b border-[#3C3C3C]">
          <h2 className="text-sm font-medium text-gray-300">对话列表</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* Empty state */}
          <div className="text-gray-500 text-center py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无对话</p>
          </div>
        </div>

        {/* New Session Button */}
        <div className="p-2 border-t border-[#3C3C3C]">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
            <Plus className="w-4 h-4" />
            新建对话
          </button>
        </div>
      </div>

      {/* Main Content - Chat Area */}
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">选择或创建一个对话</p>
          <p className="text-sm text-gray-500">当前租户: {currentTenant.name}</p>
        </div>
      </div>
    </div>
  );
}

export default SessionsPage;
