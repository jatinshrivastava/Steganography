import PropTypes from "prop-types";
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { useDispatch } from "react-redux";
import { Constants } from "../constants";
import { Services } from "../store/services";

const DownloadFileButton = ({ file }) => {
  const dispatch = useDispatch();

  const handleDownload = () => {
    // fetch(url)
    dispatch(Services.downloadFile(file));
  };

  return <Dropdown.Item onClick={handleDownload}>Download</Dropdown.Item>;
};

DownloadFileButton.propTypes = {
  file: PropTypes.object.isRequired,
};

export default DownloadFileButton;
