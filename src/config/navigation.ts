export const navAluno = [
    {
        title: 'Principal',
        items: [
            { label: 'Meu painel', href: '/dashboard', icon: '📊', badge: 3 },
            {
                label: 'Atividades',
                href: '/atividades',
                icon: '📋',
                children: [
                    { label: 'Pendentes', href: '/atividades?status=PENDENTE' },
                    { label: 'Em andamento', href: '/atividades?status=EM_ANDAMENTO' },
                    { label: 'Concluídas', href: '/atividades?status=CONCLUIDA' },
                ],
            },
            { label: 'Meu progresso', href: '/progresso', icon: '📈', disabled: true },
        ],
    },
    {
        title: 'Conta',
        items: [{ label: 'Perfil', href: '/perfil', icon: '👤', disabled: true }],
    },
]

export const navProfessor = [
    {
        title: 'Gestão',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: '📊' },
            {
                label: 'Atividades',
                href: '/atividades',
                icon: '📋',
                children: [
                    { label: 'Aprovações', href: '/atividades/aprovacoes', badge: 5, disabled: true },
                    { label: 'Todas', href: '/atividades' },
                ],
            },
            {
                label: 'Alunos',
                href: '/alunos/turmas',
                icon: '👥',
                children: [
                    { label: 'Turmas', href: '/alunos/turmas' },
                    { label: 'Progresso', href: '/alunos/progresso', disabled: true },
                ],
            },
        ],
    },
    {
        title: 'Administração',
        items: [{ label: 'Configurações', href: '/configuracoes', icon: '⚙️', disabled: true }],
    },
]
