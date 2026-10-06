import React from 'react';
import styled from 'styled-components';

const CustomInput = styled.input`
  &::file-selector-button {
    margin-right: 20px;
    border: none;
    background: #084cdf;
    padding: 10px 20px;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    transition: background .2s ease-in-out;

    &:hover {
      background: #0d45a5;
    }
  }
`;

class UploadFile extends React.Component {
  render() {
    return (
      <div>
        <CustomInput
        type="file"
        accept="image/*"
        onChange={this.props.onChange}
      />
      </div>
      
    );
  }
}

export default UploadFile;
