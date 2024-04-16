import PropTypes from "prop-types";
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";

import { Constants } from "../constants";

const DownloadFileButton = ({ file }) => {
  const handleDownload = () => {
    // const url = Constants.BASE_URL + file.file_path;
    // fetch(url)
    //   .then((response) => response.blob())
    //   .then((blob) => {
    //     // Extract filename and extension from the file's path
    //     const filename = file.file_name;
    //     const extension = filename.split(".").pop(); // Get the extension
    //     // Create a temporary URL for the blob
    //     const blobUrl = window.URL.createObjectURL(blob);
    //     // Create a link element
    //     const link = document.createElement("a");
    //     // Set the link's href attribute to the temporary URL
    //     link.href = blobUrl;
    //     // Set the link's download attribute to the filename
    //     link.download = filename;
    //     // Set the correct MIME type for the blob
    //     link.type = `application/${extension}`;
    //     // Programmatically click the link to trigger the download
    //     link.click();
    //     // Clean up: revoke the temporary URL
    //     window.URL.revokeObjectURL(blobUrl);
    //     return 0;
    //   })
    //   .catch((error) => {
    //     console.error("Error downloading file:", error);
    //   });
  };

  return <Dropdown.Item onClick={handleDownload}>Download</Dropdown.Item>;
};

DownloadFileButton.propTypes = {
  file: PropTypes.object.isRequired,
};

export default DownloadFileButton;
