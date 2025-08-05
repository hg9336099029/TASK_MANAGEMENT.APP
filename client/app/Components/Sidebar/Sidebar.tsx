import React from "react";
import Profile from "../Profile/Profile";
import RadialChart from "../RadialChart/RadialChart";
import { useUserContext } from "@/context/userContext";

function Sidebar() {
  const { logoutUser } = useUserContext();
  return (
    <div className="w-[20rem]  mt-[5rem] h-[calc(50%-5rem)] fixed right-0 top-0 bottom-0 bg-[#f9f9f9] flex flex-col">
      <Profile />
      <div className="mt-2 mx-2">
        <RadialChart />
      </div>

      <button
        className=" mt-3 mb-6 mx-6 py-4 px-8 bg-[#EB4E31] text-white rounded-[50px] hover:bg-[#3aafae] transition duration-200 ease-in-out"
        onClick={logoutUser}
      >
        Sign Out
      </button>
    </div>
  );
}

export default Sidebar;
