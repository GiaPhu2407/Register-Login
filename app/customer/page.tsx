"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, Bell, Search, User, LogOut } from "lucide-react";
import ProfileSettings from "../component/ProfileSetting";
import ProfileDropdown from "../component/ProfileDropdown";

export default function CustomerDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  // Add a refresh trigger to force reloads
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load user data from localStorage whenever refreshTrigger changes
  useEffect(() => {
    const loadUserData = () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      } else {
        // Redirect to login if no user data is found
        router.push("/Login");
      }
    };

    loadUserData();

    // Set up an event listener to detect localStorage changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userData" && e.newValue) {
        try {
          setUserData(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing userData from localStorage:", error);
        }
      }
    };

    // Add event listener
    window.addEventListener("storage", handleStorageChange);

    // Clean up event listener
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshTrigger, router]);

  // Function to refresh user data from API
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/Login");
        return;
      }

      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      // Update localStorage and state
      localStorage.setItem("userData", JSON.stringify(data.user));
      setUserData(data.user);

      return data.user;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  const handleProfileUpdate = (updatedData: any) => {
    // Update local state
    setUserData(updatedData);

    // Refresh data from server to ensure everything is in sync
    refreshUserData();

    // Increment refresh trigger to force re-render
    setRefreshTrigger((prev) => prev + 1);

    // Close profile modal
    setShowProfile(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    router.push("/Login");
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600">Shop</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="#"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Trang chủ
                </a>
                <a
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Sản phẩm
                </a>
                <a
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Khuyến mãi
                </a>
                <a
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Liên hệ
                </a>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
                <div className="max-w-lg w-full lg:max-w-xs">
                  <label htmlFor="search" className="sr-only">
                    Tìm kiếm
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Tìm kiếm"
                      type="search"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 ml-4">
                <button className="text-gray-400 hover:text-gray-500">
                  <Heart className="h-6 w-6" />
                </button>
                <button className="text-gray-400 hover:text-gray-500">
                  <ShoppingBag className="h-6 w-6" />
                </button>
                <button className="text-gray-400 hover:text-gray-500">
                  <Bell className="h-6 w-6" />
                </button>
                <div className="ml-3 relative">
                  <ProfileDropdown
                    userData={userData}
                    onLogout={handleLogout}
                    onProfileClick={() => setShowProfile(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Settings Modal */}
      {showProfile && (
        <ProfileSettings
          userData={userData}
          onClose={() => setShowProfile(false)}
          onUpdate={handleProfileUpdate}
          onChangePassword={() => {
            // Có thể mở modal đổi mật khẩu hoặc xử lý logic khác
            // Giữ nguyên đoạn này nếu bạn sẽ triển khai sau
          }}
        />
      )}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* User Profile Summary */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {userData.fullname}
                </h2>
                <p className="text-sm text-gray-500">{userData.email}</p>
                {userData.phone && (
                  <p className="text-sm text-gray-500">{userData.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBag className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Đơn hàng của bạn
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        5
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-900"
                >
                  Xem tất cả
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Heart className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sản phẩm yêu thích
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        12
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-900"
                >
                  Xem tất cả
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Thông báo mới
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        3
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-900"
                >
                  Xem tất cả
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Đơn hàng gần đây
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã đơn hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày đặt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #12345
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        15/04/2024
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        1.500.000đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Đã giao hàng
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #12344
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        14/04/2024
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2.300.000đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Đang giao
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </button>
        </div>
      </main>
    </div>
  );
}
