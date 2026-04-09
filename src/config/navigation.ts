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
                    { label: 'Pendentes', href: '/atividades?status=pendente' },
                    { label: 'Concluídas', href: '/atividades?status=concluido' },
                    { label: 'Reprovadas', href: '/atividades?status=reprovado' },
                ],
            },
            { label: 'Meu progresso', href: '/progresso', icon: '📈' },
        ],
    },
    {
        title: 'Conta',
        items: [{ label: 'Perfil', href: '/perfil', icon: '👤' }],
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
                    { label: 'Criar atividade', href: '/atividades/criar' },
                    { label: 'Aprovações', href: '/atividades/aprovacoes', badge: 5 },
                    { label: 'Todas', href: '/atividades/todas' },
                ],
            },
            {
                label: 'Alunos',
                href: '/alunos',
                icon: '👥',
                children: [
                    { label: 'Turmas', href: '/alunos/turmas' },
                    { label: 'Progresso', href: '/alunos/progresso' },
                ],
            },
        ],
    },
    {
        title: 'Administração',
        items: [{ label: 'Configurações', href: '/configuracoes', icon: '⚙️' }],
    },
]