// Avatar images (you'll need to add these to your assets/avatars folder)
const avatar1 = require('../assets/avatars/avatar1.png');
const avatar2 = require('../assets/avatars/avatar2.png');
const avatar3 = require('../assets/avatars/avatar3.png');
const avatar4 = require('../assets/avatars/avatar4.png');
const avatar5 = require('../assets/avatars/avatar5.png');
const avatar6 = require('../assets/avatars/avatar6.png');

export const defaultAvatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6];

// Function to get a random avatar
export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
  return {
    avatarIndex: randomIndex,
    avatarUri: defaultAvatars[randomIndex]
  };
};

// Function to get avatar by index
export const getAvatarByIndex = (index: number) => {
  const safeIndex = index >= 0 && index < defaultAvatars.length ? index : 0;
  return {
    avatarIndex: safeIndex,
    avatarUri: defaultAvatars[safeIndex]
  };
};
