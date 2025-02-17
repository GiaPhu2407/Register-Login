"use client";
import React, { useState } from "react";
import { X, Key } from "lucide-react";
import Link from "next/link";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateUser = async () => {
    try {
      setIsLoading(true); // Bắt đầu loading
      setError(""); // Reset lỗi cũ

      console.log("Submitting data:", formData);

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
          username: formData.username,
          fullname: formData.fullname,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.details
            ?.map((err: any) => `${err.field}: ${err.message}`)
            .join(", ") ||
          data.error ||
          "Có lỗi xảy ra khi cập nhật thông tin.";
        throw new Error(errorMessage);
      }

      console.log("Cập nhật thành công:", data);

      // Nếu API trả về thông tin user mới, cập nhật lại giao diện
      if (data.user) {
        updateLocalStorage(data.user); // Lưu vào localStorage
        onUpdate(data.user); // Cập nhật parent component

        setFormData({
          username: data.user.username,
          fullname: data.user.fullname,
          phone: data.user.phone || "",
          address: data.user.address || "",
        });
      }

      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      console.error("Lỗi chi tiết:", err);
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  // Function to update user data in local storage
  const updateLocalStorage = (updatedUser: any) => {
    try {
      // Get existing user data from localStorage (if any)
      const storedUserData = localStorage.getItem("userData");

      if (storedUserData) {
        // Parse the existing data
        const userData = JSON.parse(storedUserData);

        // Update only the fields that can be changed
        const updatedUserData = {
          ...userData,
          username: updatedUser.username,
          fullname: updatedUser.fullname,
          phone: updatedUser.phone,
          address: updatedUser.address,
        };

        // Save the updated data back to localStorage
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        console.log("User data updated in localStorage");
      } else {
        // If no data exists yet, store the complete user object
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        console.log("User data saved to localStorage for the first time");
      }
    } catch (error) {
      console.error("Error updating localStorage:", error);
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

  // Helper function to get role display name
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
                onChange={handleChange}
                readOnly={!isEditing}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
                  isEditing ? "bg-white" : "bg-gray-50"
                }`}
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
                <Link href={"/ChangePassword"}>Change Password</Link>
              </button>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end rounded-b-lg space-x-4">
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
                onClick={handleUpdateUser}
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
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
