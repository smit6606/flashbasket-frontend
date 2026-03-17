'use client';

import React from 'react';
import { Tooltip, TooltipProps, Fade, styled } from '@mui/material';

interface CustomTooltipProps extends Omit<TooltipProps, 'children'> {
    children: React.ReactElement<any, any>;
}

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .MuiTooltip-tooltip`]: {
        backgroundColor: '#1e293b',
        color: '#ffffff',
        fontSize: '0.75rem',
        fontWeight: 800,
        borderRadius: '8px',
        padding: '6px 12px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    [`& .MuiTooltip-arrow`]: {
        color: '#1e293b',
    },
}));

const CustomTooltip = React.forwardRef<unknown, CustomTooltipProps>((props, ref) => {
    const { children, title, placement = 'top', arrow = true, ...rest } = props;

    // Filter out empty titles to prevent rendering empty tooltips
    if (!title) return <>{children}</>;

    return (
        <StyledTooltip
            {...rest}
            title={title}
            placement={placement}
            arrow={arrow}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 400 }}
            enterDelay={200}
            leaveDelay={0}
            // Ensure Tooltip is rendered in a Portal and has sensible defaults
            PopperProps={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 8],
                        },
                    },
                    {
                        name: 'preventOverflow',
                        options: {
                            boundary: 'viewport',
                        },
                    },
                ],
            }}
        >
            {children}
        </StyledTooltip>
    );
});

CustomTooltip.displayName = 'CustomTooltip';

export default CustomTooltip;
