import React, {useState} from 'react';
import { NavLink } from '@mantine/core';


const WhietboardNav = ({project_id}) => {
    const [active, setActive] = useState(false);
    const location = window?.location?.hash;
    const url = `#/project/whiteboard/${project_id}`;

    return (
        <>
            <NavLink
                href={url}
                key={`Whiteboard`}
                active={active}
                label={`Whiteboard`}
                onClick={() => setActive(true)}
                variant="filled"
                size="sm"
                color={location==='#/project/whiteboard' ? "#fff" : "#000"}
                className={`rounded font-semibold text-black-600 bg:hover`}
                style={{padding:"5px 20px", backgroundColor: location==='#/whiteboard' ? "#39758D" : "#EBF1F4",  color: location==='#/whiteboard' ? "#fff" : "#000"}}
            />
        </>
        
    );
}

export default WhietboardNav;
