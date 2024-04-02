import "../../sass/style.scss";

export const Utils = {
  formatDate: (dateString) => {
    const dateObject = new Date(dateString);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return dateObject.toLocaleDateString("en-US", options);
  },

  downloadHash: (hash, hashName) => {
    // Create a Blob with the hash
    const blob = new Blob([hash], { type: "text/plain;charset=utf-8" });

    // Create a link element
    const link = document.createElement("a");

    // Set the URL of the link to the Blob
    link.href = URL.createObjectURL(blob);

    // Set the download attribute of the link to the hash name
    link.download = `${hashName}.txt`;

    // Append the link to the body
    document.body.appendChild(link);

    // Simulate a click on the link
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
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
