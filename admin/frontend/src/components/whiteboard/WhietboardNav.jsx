import React, { useState } from 'react';
import { NavLink, Tooltip } from '@mantine/core';


const WhietboardNav = ({ project_id }) => {
    const [active, setActive] = useState(false);
    const location = window?.location?.hash;
    const url = `#/project/whiteboard/${project_id}`;

    return (
        <>
            <Tooltip withinPortal={false} className="!py-0 !text-[10px] !z-10" label={"Beta"} opened position="top" offset={{ mainAxis: -8, crossAxis: 38 }} color="red" size="xs">
                <NavLink
                    href={url}
                    key={`Whiteboard`}
                    active={active}
                    label={`Whiteboard`}
                    onClick={() => setActive(true)}
                    variant="filled"
                    size="sm"
                    color={location === url ? "#fff" : "#000"}
                    className={`rounded font-semibold text-black-600 bg:hover`}
                    style={{ padding: "5px 20px", backgroundColor: location === url ? "#39758D" : "#EBF1F4", color: location === url ? "#fff" : "#000" }}
                />
            </Tooltip>
        </>

    );
}

export default WhietboardNav;
