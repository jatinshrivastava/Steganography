import PropTypes from "prop-types";
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";

import { Constants } from "../constants";

const DownloadFileButton = ({ file }) => {
  const handleDownload = () => {
    const url = Constants.BASE_URL + file.file_path;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(new Blob([blob]));
        // Create a link element
        const link = document.createElement("a");
        // Set the link's href attribute to the temporary URL
        link.href = blobUrl;
        // Set the link's download attribute to the filename
        link.download = file.file_name;
        // Programmatically click the link to trigger the download
        link.click();
        // Clean up: revoke the temporary URL
        window.URL.revokeObjectURL(blobUrl);
        return 0;
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      });
  };

  return <Dropdown.Item onClick={handleDownload}>Download</Dropdown.Item>;
};

DownloadFileButton.propTypes = {
  file: PropTypes.object.isRequired,
};

export default DownloadFileButton;
