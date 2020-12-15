import React from 'react'
import { BasePropertyProps } from 'admin-bro';
import { Box } from '@admin-bro/design-system';

const Show: React.FC<BasePropertyProps> = (props) => {
    const { record } = props
    let filePath = ''
    const filename = record.params['anexo'];
    if (filename) {
         filePath = `/uploads/${record.params['_id']}/${filename}`
    }
    return (
        <Box>
            {filename ? (
                <a href={filePath} download>
                    {filename}
                </a>
            ) : 'Demanda sem anexo'}
        </Box>
    )
}

export default Show