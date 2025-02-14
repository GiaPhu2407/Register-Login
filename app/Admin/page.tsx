"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ShoppingBag, BarChart3, Settings, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    router.push("/Login");
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
          </div>

          <nav className="flex-1">
            <div className="px-4 space-y-2">
              <button className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                <Users className="w-5 h-5 mr-4" />
                Quản lý người dùng
              </button>

              <button className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                <ShoppingBag className="w-5 h-5 mr-4" />
                Quản lý sản phẩm
              </button>

              <button className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                <BarChart3 className="w-5 h-5 mr-4" />
                Thống kê
              </button>

              <button className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                <Settings className="w-5 h-5 mr-4" />
                Cài đặt
              </button>
            </div>
          </nav>

          <div className="p-6 border-t">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {userData.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {userData.fullname}
                </p>
                <p className="text-xs text-gray-500">{userData.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">
              Tổng người dùng
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">1,234</p>
            <div className="text-green-500 text-sm mt-2">
              ↑ 12% so với tháng trước
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Đơn hàng mới</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">56</p>
            <div className="text-green-500 text-sm mt-2">
              ↑ 8% so với tháng trước
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">
              Doanh thu tháng
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">45.6M</p>
            <div className="text-red-500 text-sm mt-2">
              ↓ 3% so với tháng trước
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Sản phẩm mới</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">89</p>
            <div className="text-green-500 text-sm mt-2">
              ↑ 24% so với tháng trước
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Hoạt động gần đây
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoạt động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">N</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">
                          Nguyễn Văn A
                        </p>
                        <p className="text-sm text-gray-500">
                          user@example.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Đăng nhập
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    5 phút trước
                  </td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
