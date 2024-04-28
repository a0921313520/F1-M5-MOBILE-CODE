import React from "react";

const Radio = (props) => {
  const {
    checked,
    label,
    label2,
    id,
    name,
    value,
    onChange,
    RadioLength
  } = props;

  return (
    <>
    {RadioLength === 1 ?
      <>
      <div className="radio__btn" >
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked
          onChange={onChange}
        />
        {label2===""?
        <label for="contactChoice1" > {label}</label> 
        :
        <>
          <label for="contactChoice1" > {label}</label>
          <p>&nbsp;</p>
          <label for="contactChoiceRed" style={{color:"#00A6FF"}}> {label2}</label>
        </>
        }
        
      </div>
      <br />
      </>
      :
      <>
      <div className="radio__btn" >
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
        />
        {label2===""?
        <label for="contactChoice1" > {label}</label> 
        :
        <>
          <label for="contactChoice1" > {label}</label>
          <p>&nbsp;</p>
          <label for="contactChoiceRed" style={{color:"#00A6FF"}}> {label2}</label>
        </>
        }
      </div>
      <br />
      </>
    }
    </>
  );
};

export default Radio;
