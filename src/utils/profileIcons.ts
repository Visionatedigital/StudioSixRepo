const profileIcons = [
  '/profile-icons/profile-icon-01.png',
  '/profile-icons/profile-icon-02.png',
  '/profile-icons/profile-icon-03.png',
  '/profile-icons/profile-icon-04.png',
  '/profile-icons/profile-icon-05.png',
  '/profile-icons/profile-icon-06.png',
  '/profile-icons/profile-icon-07.png',
  '/profile-icons/profile-icon-08.png',
  '/profile-icons/profile-icon-09.png',
  '/profile-icons/profile-icon-10.png',
  '/profile-icons/profile-icon-11.png',
  '/profile-icons/profile-icon-12.png',
  '/profile-icons/profile-icon-13.png',
];

export const getRandomProfileIcon = () => {
  const randomIndex = Math.floor(Math.random() * profileIcons.length);
  return profileIcons[randomIndex];
};

export const getConsistentProfileIcon = (identifier: string) => {
  // Use the sum of character codes in identifier to create a deterministic index
  const charCodeSum = identifier.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const iconIndex = charCodeSum % profileIcons.length; // Use mod to ensure we stay within bounds
  return profileIcons[iconIndex];
}; 