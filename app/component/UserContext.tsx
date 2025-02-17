"use client";
import { useState, useEffect, createContext, useContext } from "react";
import ProfileSettings from "./ProfileSetting";

// Create a context for user data
const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Load user data from localStorage on initial render
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleProfileUpdate = (updatedData: any) => {
    setUserData(updatedData);
    // The actual localStorage update is handled in the ProfileSettings component
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  const handleChangePassword = () => {
    // Handle change password logic here
  };

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}

      {/* Profile settings modal */}
      {isProfileOpen && userData && (
        <ProfileSettings
          userData={userData}
          onClose={handleCloseProfile}
          onUpdate={handleProfileUpdate}
          onChangePassword={handleChangePassword}
        />
      )}

      {/* Button to open profile settings */}
      <button
        onClick={() => setIsProfileOpen(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
      >
        Open Profile Settings
      </button>
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Example usage in other components:
export const ProfileButton = () => {
  const { userData } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!userData) return null;

  return (
    <>
      <button onClick={() => setIsProfileOpen(true)}>
        {userData.username}
      </button>

      {isProfileOpen && (
        <ProfileSettings
          userData={userData}
          onClose={() => setIsProfileOpen(false)}
          onUpdate={(updatedData: any) => {
            // This will update the UserContext and affect all components using it
            const { setUserData } = useUser();
            setUserData(updatedData);
          }}
          onChangePassword={() => {
            /* Handle change password */
          }}
        />
      )}
    </>
  );
};
