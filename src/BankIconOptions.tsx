import React from 'react';
import { BsBank, BsBank2 } from 'react-icons/bs';
import { AiFillBank, AiOutlineBank } from 'react-icons/ai';
import { RiBankFill, RiBankLine } from 'react-icons/ri';
import { PiBank, PiBankFill } from 'react-icons/pi';
import { BiSolidBank } from 'react-icons/bi';
import { CiBank } from 'react-icons/ci';
import { TbBuildingBank } from 'react-icons/tb';

const BankIconOptions = () => {
  const iconSize = 30;
  const style = { margin: '10px', padding: '10px' };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Bank Icon Options</h2>
      
      <div>
        <h3>Bootstrap Icons</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={style}>
            <BsBank size={iconSize} />
            <p>BsBank</p>
          </div>
          <div style={style}>
            <BsBank2 size={iconSize} />
            <p>BsBank2</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Ant Design Icons</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={style}>
            <AiFillBank size={iconSize} />
            <p>AiFillBank</p>
          </div>
          <div style={style}>
            <AiOutlineBank size={iconSize} />
            <p>AiOutlineBank</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Remix Icons</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={style}>
            <RiBankFill size={iconSize} />
            <p>RiBankFill</p>
          </div>
          <div style={style}>
            <RiBankLine size={iconSize} />
            <p>RiBankLine</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Phosphor Icons</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={style}>
            <PiBank size={iconSize} />
            <p>PiBank</p>
          </div>
          <div style={style}>
            <PiBankFill size={iconSize} />
            <p>PiBankFill</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3>BoxIcons</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={style}>
            <BiSolidBank size={iconSize} />
            <p>BiSolidBank</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Circum Icons</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={style}>
            <CiBank size={iconSize} />
            <p>CiBank</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Tabler Icons</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={style}>
            <TbBuildingBank size={iconSize} />
            <p>TbBuildingBank</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankIconOptions;
