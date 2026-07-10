import React from "react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  renderTabContent: () => React.ReactNode;
  uploading: boolean;
  handleClickUpload: () => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  renderTabContent,
  uploading,
  handleClickUpload,
}: SidebarProps) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${
          sidebarOpen ? "fixed inset-y-0 left-0 z-50" : "hidden"
        } lg:flex w-72 bg-white border-r border-slate-200 flex-col flex-shrink-0`}
      >
        <div className="flex items-center space-x-2.5 px-4 py-3 border-b border-slate-200">
          <img src="/Images/logo.png" alt="Electrical AI" className="h-8 object-contain" />
          <div>
            <span className="text-xs font-bold tracking-wider text-slate-800 uppercase block">Electrical AI</span>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col space-y-3 overflow-y-auto">
          <button
            onClick={handleClickUpload}
            disabled={uploading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg shadow-sm cursor-pointer transition-colors text-xs uppercase tracking-wider"
          >
            ☝ {uploading ? "ĐANG TẢI..." : "UPLOAD DIAGRAM"}
          </button>

          {renderTabContent()}
        </div>
      </aside>
    </>
  );
}
