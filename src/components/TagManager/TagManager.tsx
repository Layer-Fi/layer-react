import React, { useState, useRef, useEffect } from 'react';

export const TagManager = ({ tag, updateTag, goBack, deleteTag }) => {
  const [tagName, setTagName] = useState(tag.name);
  const [subtagInput, setSubtagInput] = useState('');
  const [editingSubtag, setEditingSubtag] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        goBack({ ...tag, name: tagName });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef, goBack, tag, tagName]);

  useEffect(() => {
    setTagName(tag.name);
  }, [tag.name]);

  const handleAddSubtag = () => {
    if (subtagInput && !tag.subtags.includes(subtagInput)) {
      const updatedTag = { ...tag, subtags: [...tag.subtags, subtagInput] };
      updateTag(updatedTag);
      setSubtagInput('');
    }
  };

  const handleDeleteSubtag = (subtag) => {
    const updatedTag = { ...tag, subtags: tag.subtags.filter(st => st !== subtag) };
    updateTag(updatedTag);
  };

  const handleEditSubtag = (subtag) => {
    setEditingSubtag(subtag);
  };

  const handleUpdateSubtag = (e) => {
    if (editingSubtag) {
      const updatedTag = {
        ...tag,
        subtags: tag.subtags.map(sub => sub === editingSubtag ? e.target.value : sub),
      };
      updateTag(updatedTag);
      setEditingSubtag(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddSubtag();
    }
  };

  const handleTagNameChange = (e) => {
    setTagName(e.target.value);
    const updatedTag = { ...tag, name: e.target.value };
    updateTag(updatedTag);
  };

  return (
    <div className="layer__input-block" ref={containerRef}>
      <h3>Tag added</h3>
      <input
        type="text"
        className="layer__tag-manager-input"
        value={tagName}
        onChange={handleTagNameChange}
        placeholder="Tag name"
      />
      <input
        type="text"
        className="layer__tag-manager-input"
        value={subtagInput}
        onChange={(e) => setSubtagInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Add subtag value"
      />
      <div className="layer__tag-manager-subtags-list">
        {tag.subtags.map((subtag, index) => (
          <div key={index} className="layer__tag-manager-subtag">
            {editingSubtag === subtag ? (
              <input
                type="text"
                className="layer__tag-manager-edit-input"
                defaultValue={subtag}
                onBlur={handleUpdateSubtag}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateSubtag(e);
                  }
                }}
              />
            ) : (
              <span onClick={() => handleEditSubtag(subtag)}>{subtag}</span>
            )}
            <button onClick={() => handleDeleteSubtag(subtag)}>Delete</button>
          </div>
        ))}
      </div>
      {subtagInput && !tag.subtags.includes(subtagInput) && (
        <div className="layer__suggestion-item" onClick={handleAddSubtag}>
          Create '{subtagInput}'
        </div>
      )}
      <button onClick={() => deleteTag(tag)}>Delete Tag</button>
      <button onClick={() => goBack({ ...tag, name: tagName })}>Go Back</button>
    </div>
  );
};
