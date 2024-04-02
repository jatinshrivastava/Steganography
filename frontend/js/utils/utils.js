import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../sass/style.scss";
import {
  faFileShield,
  faFileImage,
  faFileAudio,
  faFileVideo,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";

export const Utils = {
  formatDate: (dateString) => {
    const dateObject = new Date(dateString);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return dateObject.toLocaleDateString("en-US", options);
  },

  renderFileIcon: (filePath) => {
    const fileName = filePath.split("/").pop(); // Extracting the file name from the path
    const fileExtension = fileName.split(".").pop().toLowerCase(); // Extracting the file extension

    switch (fileExtension) {
      case "jpeg":
      case "jpg":
      case "png":
      case "gif":
      case "svg":
        return (
          <img
            alt="..."
            className="card-img-top custom-file-image"
            src={filePath}
          />
        );
      case "enc":
        return (
          <FontAwesomeIcon className="custom-file-icon" icon={faFileShield} />
        );
      case "mp3":
      case "wav":
      case "ogg":
        return (
          <FontAwesomeIcon className="custom-file-icon" icon={faFileAudio} />
        );
      case "mp4":
      case "mov":
      case "avi":
      case "mkv":
        return (
          <FontAwesomeIcon className="custom-file-icon" icon={faFileVideo} />
        );
      default:
        return (
          <FontAwesomeIcon className="custom-file-icon" icon={faFileAlt} />
        );
    }
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
