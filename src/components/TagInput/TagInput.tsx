import React, { useState, useRef, useEffect } from 'react';
import { TagManager } from '../TagManager/TagManager';

const initialSuggestedTags = ['Product', 'Other suggested tag'];

const initialTags = [
  {
    name: 'Time',
    subtags: ['Morning', 'Evening', 'Night'],
  },
  {
    name: 'Location',
    subtags: ['Manhattan', 'Brooklyn', 'New Jersey', 'Queens', 'Bronx'],
  },
  {
    name: 'Product',
    subtags: ['Fuel', 'Food'],
  },
];

export const TagInput = () => {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState(initialTags);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowInput(false);
        setSelectedTag(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddTag = () => {
    if (inputValue && !tags.some(t => t.name === inputValue)) {
      const newTag = { name: inputValue, subtags: [] };
      setTags([...tags, newTag]);
      setSelectedTag(newTag);
      setInputValue('');
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
  };

  const handleDeleteTag = (tag) => {
    setTags(tags.filter(t => t.name !== tag.name));
    setSelectedTag(null);
  };

  const handleUpdateTag = (updatedTag) => {
    setTags(tags.map(t => (t.name === selectedTag.name ? updatedTag : t)));
    setSelectedTag(updatedTag);
  };

  const handleGoBack = (updatedTag) => {
    handleUpdateTag(updatedTag);
    setSelectedTag(null);
    setShowInput(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <div className="layer__tag-input-container" ref={containerRef}>
      {selectedTag ? (
        <TagManager
          tag={selectedTag}
          updateTag={handleUpdateTag}
          goBack={handleGoBack}
          deleteTag={handleDeleteTag}
        />
      ) : (
        <>
          <button className={`layer__add-tag-button ${showInput ? 'hidden' : ''}`} onClick={() => setShowInput(true)}>Add Tag</button>
          {showInput && (
            <div className="layer__input-block">
              <input
                type="text"
                className="layer__tag-input"
                value={inputValue}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Add or select tag"
              />
              <div className="layer__tags-list">
                <h4>My tags</h4>
                {tags.map((tag) => (
                  <div key={tag.name} className="layer__tag">
                    <span>{tag.name}</span>
                    <div className="layer__subtags">
                      {tag.subtags.map(subtag => (
                        <span key={subtag} className="layer__subtag">
                          {subtag}
                        </span>
                      ))}
                    </div>
                    <button onClick={() => handleTagClick(tag)}>...</button>
                  </div>
                ))}
              </div>
              <div className="layer__suggested-tags">
                <h4>Suggested tags</h4>
                {initialSuggestedTags.map((tag) => (
                  <div key={tag} className="layer__tag" onClick={() => handleTagClick({ name: tag, subtags: [] })}>
                    {tag}
                  </div>
                ))}
                {inputValue && !tags.some(t => t.name === inputValue) && (
                  <div className="layer__suggestion-item" onClick={handleAddTag}>
                    Create '{inputValue}'
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
