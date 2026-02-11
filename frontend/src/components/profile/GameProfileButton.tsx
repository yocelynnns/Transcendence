import { ASSETS } from "../../assets";
import { AvatarData } from "../../types/avatarTypes";

interface AvatarProfileButtonProps {
  avatarData: AvatarData;
  onClick: () => void; // toggles showProfilePanel
}

export default function AvatarProfileButton({ avatarData, onClick }: AvatarProfileButtonProps) {
  const defaultAvatar = ASSETS.AVATAR.CLEFFA;

  const truncateName = (name: string, maxLength: number = 10) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 2) + "..";
  };

  return (
    <div className="m-4 transform-origin-top-left w-[400px] h-[160px]">
      <div
        onClick={onClick}
        className="relative cursor-pointer w-full h-40 z-50"
      >
        {/* NAME */}
        {/* <div className="absolute left-52 top-1/4 -translate-y-1/5 text-[#a7767c] font-bold text-3xl drop-shadow-lg pointer-events-none z-30 pixelify-sans">
          PROFILE
        </div> */}

        {/* NAME */}
        <div className="left-35 top-7/32 absolute inset-0 flex justify-center z-40 pointer-events-none">
          <span className="text-[#a7767c] font-bold text-3xl drop-shadow-lg pixelify-sans text-center"
            style={{width: "10ch"}}>
            {truncateName(avatarData.userName)}
          </span>
        </div>

        {/* BANNER */}
        <div
          className="absolute inset-0 bg-center bg-cover rounded-lg z-20"
          style={{ backgroundImage: `url(${ASSETS.ELEMENTS.PROFILEBANNER})` }}
        />

        {/* AVATAR */}
        <div
          className="absolute left-5 top-1/2 -translate-y-1/2 w-30 h-30 border-2 border-white bg-center bg-cover shadow-md z-10"
          style={{
            backgroundImage: `url(${avatarData.avatar || defaultAvatar})`,
          }}
        />
      </div>
    </div>
  );
}
