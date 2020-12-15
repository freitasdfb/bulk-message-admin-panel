import React from 'react';
import { BasePropertyProps } from 'admin-bro';
import { Box, Label, DropZone, DropZoneProps } from '@admin-bro/design-system'

const Edit: React.FC<BasePropertyProps> = (props) => {

    const { property, onChange} = props;

    const handleDropZoneChange: DropZoneProps['onChange'] = (files) => {
        onChange(property.name, files[0]);
    }

    return (
        <Box>
            <Label>Insira o anexado que acompanhará a mensagem</Label>
            <DropZone onChange={handleDropZoneChange}/>
        </Box>
    )
}

export default Edit;