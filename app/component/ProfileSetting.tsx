"use client";
import React, { useState, useEffect } from "react";
import { X, Key } from "lucide-react";
import { toast } from "sonner";

interface ProfileSettingsProps {
  userData: {
    username: string;
    fullname: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
  };
  onClose: () => void;
  onUpdate: (updatedData: any) => void;
  onChangePassword: () => void;
}

export default function ProfileSettings({
  userData,
  onClose,
  onUpdate,
  onChangePassword,
}: ProfileSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: userData.username,
    fullname: userData.fullname,
    phone: userData.phone || "",
    address: userData.address || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form data when userData changes
  useEffect(() => {
    setFormData({
      username: userData.username,
      fullname: userData.fullname,
      phone: userData.phone || "",
      address: userData.address || "",
    });
  }, [userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập. Vui lòng thử lại!");
      }

      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể tải thông tin người dùng.");
      }

      // Update with fresh data from server
      updateLocalStorage(data.user);
      onUpdate(data.user);

      return data.user;
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu người dùng:", err);
      return null;
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập. Vui lòng thử lại!");
      }

      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullname: formData.fullname,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details
            ?.map((err: any) => `${err.field}: ${err.message}`)
            .join(", ") ||
            data.error ||
            data.message ||
            "Có lỗi xảy ra khi cập nhật thông tin."
        );
      }

      // Update local storage
      updateLocalStorage(data.user);

      // Update parent component state
      onUpdate(data.user);

      // Fetch fresh data from server to ensure everything is in sync
      const freshData = await fetchUserData();

      if (freshData) {
        // Update local form data with new values from server
        setFormData({
          username: freshData.username,
          fullname: freshData.fullname,
          phone: freshData.phone || "",
          address: freshData.address || "",
        });
      }

      // Show success message
      toast.success("Cập nhật thông tin thành công");

      setIsEditing(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Lỗi cập nhật:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocalStorage = (updatedUser: any) => {
    try {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const currentData = JSON.parse(storedUserData);
        const updatedUserData = {
          ...currentData,
          username: updatedUser.username,
          fullname: updatedUser.fullname,
          phone: updatedUser.phone,
          address: updatedUser.address,
        };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      } else {
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Lỗi cập nhật localStorage:", error);
      toast.error("Không thể lưu thông tin người dùng");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: userData.username,
      fullname: userData.fullname,
      phone: userData.phone || "",
      address: userData.address || "",
    });
    setError("");
  };

  const getRoleDisplayName = (roleId: string) => {
    const roleMap: Record<string, string> = {
      admin: "Admin",
      staff: "Staff",
      user: "User",
      nhanvien: "Nhân Viên",
    };

    const normalizedRole = roleId.toLowerCase();
    return roleMap[normalizedRole] || roleId;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleUpdateUser} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
                  isEditing ? "bg-white" : "bg-gray-50"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={userData.email}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
                  isEditing ? "bg-white" : "bg-gray-50"
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                readOnly={!isEditing}
                rows={3}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
                  isEditing ? "bg-white" : "bg-gray-50"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                type="text"
                value={getRoleDisplayName(userData.role)}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={onChangePassword}
                className="mt-1 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
