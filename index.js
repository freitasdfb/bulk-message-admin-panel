const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const AdminBro = require('admin-bro')
const AdminBroExpressjs = require('admin-bro-expressjs')
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// We have to tell AdminBro that we will manage mongoose resources with it
const canModifyUsers = ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'

let visibleItems;

AdminBro.registerAdapter(require('admin-bro-mongoose'))

const sidebarGroups = {
    user: {
        name: 'Usuários',
        icon: 'User',
    },
    products: {
        name: 'Produtos',
        icon: 'Product'
    }
};

// express server definitions
const app = express()
app.use(bodyParser.json())

// Resources definitions
const User = mongoose.model('User', {
    nome: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    encryptedPassword: {
        type: String,
        required: true,
    },
    perfil: {
        type: String,
        enum: ['usuario', 'admin'],
        required: true,
    }
})


const WppMessage = mongoose.model('wppMessage', {
    texto: {
        type: String,
        required: true,
    },
    anexo: {
        type: String,
        required: false,
    },

    baseDeDados: {
        type: String,
        required: false,
    },
    localAEnviar: {
        type: String,
    },

    status: {
        type: String,
        enum: ['aguardando', 'executando', 'executada']
    },
    ownerId: {
        type: String
    }
})

const adminBro = new AdminBro({
    branding: {
        companyName: 'MKT Messenger',
        softwareBrothers: false,
        language: 'pt'
    },
    resources: [{
        resource: User,
        options: {
            properties: {
                encryptedPassword: {
                    isVisible: false,
                },
                password: {
                    type: 'password',
                    isVisible: {
                        list: false, edit: true, filter: false, show: false,
                    },
                },
            },
            actions: {
                new: {
                    before: async (request) => {
                        if (request.payload.password) {
                            request.payload = {
                                ...request.payload,
                                encryptedPassword: await bcrypt.hash(request.payload.password, 10),
                                password: undefined,
                            }
                        }
                        return request
                    },
                    isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin',
                },
                edit: { isAccessible: ({ currentAdmin, record }) => currentAdmin && (currentAdmin.role === 'admin' || currentAdmin._id === record.param('_id'))},
                delete: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin', },
                list: {
                    before: async (request, context) => {
                        const { currentAdmin } = context
                        return {
                            ...request,
                            query: {
                                ...request.query,
                                'filters._id': currentAdmin.role === 'admin' ? '' : currentAdmin._id,
                            }
                        }
                    },
                },
            },
            parent: sidebarGroups.user
        }
    },
    {
        resource: WppMessage,
        options: {
            properties: {
                texto: {
                    type: 'richtext'
                },
                anexo: {
                    components: {
                        edit: AdminBro.bundle('./Components/anexo.tsx'),
                        list: AdminBro.bundle('./components/anexo-list.tsx'),
                        show: AdminBro.bundle('./components/anexo-show.tsx')
                    },
                    isVisible: { edit: true, list: true, show: true, filter: false }
                },
                baseDeDados: {
                    type: 'textarea',
                    isVisible: { edit: true, list: false, show: false, filter: true },
                    components: {
                        edit: AdminBro.bundle('./Components/baseDeDados-edit.tsx')
                    }
                },
                ownerId: {
                    isVisible: { filter: true, show: false, edit: false, list: false },
                },
                // status: {
                //     isVisible: { filter: true, show: true, edit: canModifyUsers, list: true },
                //     // isVisible: ({ currentAdmin }) => currentAdmin && (currentAdmin.role === 'admin')

                // }
            },
            editProperties: visibleItems,
            
            actions: {
                new: {
                    before: async (request, context) => {
                        if (request.method === 'post') {
                            const { anexo, ...otherParams } = request.payload;

                            const { currentAdmin } = context;
                            context.anexo = anexo;
                            context.ownerId = currentAdmin._id;

                            request.payload = {
                                ...request.payload,
                                otherParams,
                                ownerId: currentAdmin._id,
                                status: 'aguardando'
                            }
                        }
                        return request;
                    },

                    after: async (response, request, context) => {
                        const { record, anexo, ownerId } = context;

                        if (record.isValid() && anexo) {
                            const filePath = path.join('uploads', record.id().toString(), anexo.name);
                            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                            await fs.promises.rename(anexo.path, filePath);
                            await record.update({ anexo: `${anexo.name}` });

                            response.record.params = {
                                ...response.record.params,
                                anexoPath: `${filePath}`,
                                ownerId: ownerId
                            }
                        }
                        return response;
                    }
                },
                // edit: { isAccessible: ({ currentAdmin, record }) => currentAdmin && (currentAdmin.role === 'admin' || currentAdmin._id === record.param('ownerId')) },
                edit: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' },
                show: {
                    isVisible: ({ currentAdmin, record }) => currentAdmin && (currentAdmin.role === 'admin' || currentAdmin._id === record.param('ownerId')),
                },
                list: {
                    before: async (request, context) => {
                        const { currentAdmin } = context
                        if(currentAdmin.role === 'admin'){
                            visibleItems = ["texto", "anexo", "baseDeDados", "status"];
                        } else {
                            visibleItems = ["texto", "anexo", "baseDeDados"];
                        }
                        return {
                            ...request,
                            query: {
                                ...request.query,
                                'filters.ownerId': currentAdmin.role === 'admin' ? '' : currentAdmin._id,
                            }
                        }

                    },
                },

                delete: {
                    isAccessible: ({ currentAdmin, record }) => {
                        return currentAdmin && (
                            currentAdmin.role === 'admin'
                            || currentAdmin._id === record.param('ownerId')
                        )
                    }
                }

            },
            parent: sidebarGroups.products
        }
    },


    ],
    rootPath: '/admin',
})

//Build and use a router which will handle all AdminBro routes
const router = AdminBroExpressjs.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email, password) => {
        const user = await User.findOne({ email })
        if (user) {
            const matched = await bcrypt.compare(password, user.encryptedPassword)
            if (matched) {
                return user
            }
        }
        return false
    },
    cookiePassword: 'some-secret-password-used-to-secure-cookie',
})

app.use(adminBro.options.rootPath, router)
app.use('/uploads', express.static('uploads'));

// Running the server
const run = async () => {
    await mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true })
    await app.listen(8080, () => console.log(`ON! :)`))

}

run();