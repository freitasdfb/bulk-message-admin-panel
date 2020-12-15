import React from 'react'
import { BasePropertyProps } from 'admin-bro';
import { Box } from '@admin-bro/design-system'

const List: React.FC<BasePropertyProps> = (props) => {
    const { record } = props;

    const fileName = record.params['anexo'];
    return (
        <Box>
            {fileName ? (
                <div>{fileName}</div>
            ) : 'Sem anexo'}
        </Box>
    )
}

export default List