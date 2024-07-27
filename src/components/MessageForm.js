import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const FormWrapper = styled.div`
  margin-bottom: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 20px;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
`;

const Button = styled.button`
  margin-left: 10px;
  padding: 5px 10px;
  border: none;
  background-color: #f0f0f0;
  border-radius: 5px;
  cursor: pointer;
`;

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  z-index: 1000;
`;

const CharCounter = styled.div`
  text-align: right;
  color: ${props => (props.isLimitExceeded ? 'red' : 'black')};
`;

const MessageForm = ({ setMessage }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textAreaRef = useRef(null);
  const MAX_CHARS = 5000;

  const handleChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      setText(newText);
      setMessage(newText);
    }
  };

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiSelect = (emoji) => {
    const cursor = textAreaRef.current.selectionStart;
    const newText = text.slice(0, cursor) + emoji.native + text.slice(cursor);
    if (newText.length <= MAX_CHARS) {
      setText(newText);
      setMessage(newText);
    }
    setShowEmojiPicker(false);
  };

  const handleBoldClick = () => {
    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    const newText = text.substring(0, start) + '*' + text.substring(start, end) + '*' + text.substring(end);
    if (newText.length <= MAX_CHARS) {
      setText(newText);
      setMessage(newText);
    }
  };

  const handleAddName = () => {
    const cursorPos = textAreaRef.current.selectionStart;
    const newText = text.substring(0, cursorPos) + '{nombre}' + text.substring(cursorPos);
    if (newText.length <= MAX_CHARS) {
      setText(newText);
      setMessage(newText);
    }
  };

  return (
    <FormWrapper>
      <h2>Contenido</h2>
      <TextArea 
        ref={textAreaRef}
        value={text}
        placeholder="Introduce el mensaje"
        onChange={handleChange}
      />
      <CharCounter isLimitExceeded={text.length > MAX_CHARS}>
        {text.length}/{MAX_CHARS}
      </CharCounter>
      <ButtonGroup>
        <Button onClick={handleEmojiClick}>😊</Button>
        <Button onClick={handleBoldClick}>B</Button>
        <Button onClick={handleAddName}>+ Añadir nombre</Button>
        {showEmojiPicker && (
          <EmojiPickerWrapper>
            <Picker data={data} onEmojiSelect={onEmojiSelect} />
          </EmojiPickerWrapper>
        )}
      </ButtonGroup>
    </FormWrapper>
  );
};

export default MessageForm;
