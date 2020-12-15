import React from 'react'
import { Box, BasePropertyProps } from 'admin-bro'

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