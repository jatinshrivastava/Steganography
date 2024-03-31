import "../../sass/style.scss";

export const Utils = {
  formatDate: (dateString) => {
    const dateObject = new Date(dateString);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return dateObject.toLocaleDateString("en-US", options);
  },
};

export const Avatar = ({ name }) => {
  const [firstName, lastName] = name.split(" ");
  const firstLetter = firstName.charAt(0);
  const lastLetter = lastName ? lastName.charAt(0) : "";

  return (
    <div className="avatar-container">
      <div className="avatar-circle">
        {firstLetter}
        {lastLetter}
      </div>
    </div>
  );
};
