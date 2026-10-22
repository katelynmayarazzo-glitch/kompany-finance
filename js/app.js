(() => {
  'use strict';

  const CATEGORIES = {
    income: ['Vendas', 'Serviços', 'Investimentos', 'Outras receitas'],
    expense: ['Operacional', 'Marketing', 'Equipe', 'Software', 'Transporte', 'Alimentação', 'Impostos', 'Outras despesas']
  };

  const CATEGORY_META = {
    'Vendas': ['▣', '#f4c928'],
    'Serviços': ['✳', '#f4c928'],
    'Investimentos': ['↗', '#f4c928'],
    'Outras receitas': ['＋', '#f4c928'],
    'Operacional': ['⌂', '#d8d8d2'],
    'Marketing': ['◉', '#d8d8d2'],
    'Equipe': ['♙', '#d8d8d2'],
    'Software': ['⌘', '#d8d8d2'],
    'Transporte': ['↗', '#d8d8d2'],
    'Alimentação': ['◇', '#d8d8d2'],
    'Impostos': ['▤', '#d8d8d2'],
    'Outras despesas': ['−', '#d8d8d2']
  };

  const $ = id => document.getElementById(id);

  const money = value =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value) || 0);

  const localDate = (date = new Date()) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const dateLabel = value => {
    if (!value) return '—';
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  };

  const monthLabel = date =>
    date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

  const esc = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));

  const seedDate = (offset, day = 12) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + offset);
    date.setDate(Math.min(day, 28));
    return localDate(date);
  };

  const sample = [
    { id: 's1', description: 'Projeto identidade visual', type: 'income', category: 'Serviços', amount: 2850, date: seedDate(0, 3), notes: 'Projeto conceitual' },
    { id: 's2', description: 'Mensalidade plataforma', type: 'income', category: 'Serviços', amount: 1450, date: seedDate(0, 8), notes: '' },
    { id: 's3', description: 'Campanha digital', type: 'expense', category: 'Marketing', amount: 480, date: seedDate(0, 9), notes: '' },
    { id: 's4', description: 'Ferramentas e software', type: 'expense', category: 'Software', amount: 219.90, date: seedDate(0, 11), notes: '' },
    { id: 's5', description: 'Consultoria estratégica', type: 'income', category: 'Serviços', amount: 980, date: seedDate(-1, 6), notes: '' },
    { id: 's6', description: 'Equipamentos', type: 'expense', category: 'Operacional', amount: 730, date: seedDate(-1, 14), notes: '' },
    { id: 's7', description: 'Venda de pacote', type: 'income', category: 'Vendas', amount: 1900, date: seedDate(-2, 10), notes: '' },
    { id: 's8', description: 'Anúncios patrocinados', type: 'expense', category: 'Marketing', amount: 350, date: seedDate(-2, 15), notes: '' },
    { id: 's9', description: 'Projeto de automação', type: 'income', category: 'Serviços', amount: 3200, date: seedDate(-3, 5), notes: '' },
    { id: 's10', description: 'Impostos e taxas', type: 'expense', category: 'Impostos', amount: 410, date: seedDate(-3, 18), notes: '' },
    { id: 's11', description: 'Pacote de conteúdo', type: 'income', category: 'Vendas', amount: 1250, date: seedDate(-4, 9), notes: '' },
    { id: 's12', description: 'Licenças digitais', type: 'expense', category: 'Software', amount: 185, date: seedDate(-4, 20), notes: '' },
    { id: 's13', description: 'Consultoria', type: 'income', category: 'Serviços', amount: 2150, date: seedDate(-5, 7), notes: '' },
    { id: 's14', description: 'Despesas operacionais', type: 'expense', category: 'Operacional', amount: 560, date: seedDate(-5, 16), notes: '' }
  ];

  const defaultBudgets = [
    { category: 'Marketing', amount: 1000 },
    { category: 'Operacional', amount: 1500 },
    { category: 'Software', amount: 450 },
    { category: 'Transporte', amount: 350 },
    { category: 'Impostos', amount: 800 }
  ];

  function readStore(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  let transactions = readStore('kompanyFinanceTransactions', null);
  let budgets = readStore('kompanyFinanceBudgets', null);

  if (!Array.isArray(transactions)) {
    transactions = sample;
    saveTransactions();
  }

  if (!Array.isArray(budgets)) {
    budgets = defaultBudgets;
    saveBudgets();
  }

  function saveTransactions() {
    try {
      localStorage.setItem('kompanyFinanceTransactions', JSON.stringify(transactions));
    } catch {
      toast('Não foi possível salvar neste navegador.');
    }
  }

  function saveBudgets() {
    try {
      localStorage.setItem('kompanyFinanceBudgets', JSON.stringify(budgets));
    } catch {
      toast('Não foi possível salvar neste navegador.');
    }
  }

  function toast(message) {
    const element = $('toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 2600);
  }

  function getPeriodTransactions(period = $('periodSelect').value) {
    const now = new Date();

    return transactions.filter(transaction => {
      const date = new Date(transaction.date + 'T12:00:00');

      if (period === 'all') return true;

      if (period === 'year') {
        return date.getFullYear() === now.getFullYear();
      }

      if (period === 'last') {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return date.getFullYear() === last.getFullYear()
          && date.getMonth() === last.getMonth();
      }

      return date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth();
    });
  }

  function totals(list) {
    return list.reduce((result, transaction) => {
      if (transaction.type === 'income') {
        result.income += Number(transaction.amount);
      } else {
        result.expense += Number(transaction.amount);
      }

      return result;
    }, { income: 0, expense: 0 });
  }

  function categoryOptions(select, selected = '') {
    const categories = [
      ...new Set([...CATEGORIES.income, ...CATEGORIES.expense])
    ];

    select.innerHTML = categories.map(category => `
      <option value="${esc(category)}" ${category === selected ? 'selected' : ''}>
        ${esc(category)}
      </option>
    `).join('');
  }

  function refreshCategoryFilter() {
    const select = $('categoryFilter');
    const selected = select.value;
    const categories = [...new Set(transactions.map(t => t.category))].sort();

    select.innerHTML = '<option value="all">Todas as categorias</option>'
      + categories.map(category =>
        `<option value="${esc(category)}">${esc(category)}</option>`
      ).join('');

    if (categories.includes(selected)) select.value = selected;
  }

  function render() {
    renderDashboard();
    renderTransactions();
    renderBudgets();
    renderReports();
  }

  function renderDashboard() {
    const list = getPeriodTransactions();
    const result = totals(list);
    const net = result.income - result.expense;

    $('metricBalance').textContent = money(net);
    $('metricIncome').textContent = money(result.income);
    $('metricExpense').textContent = money(result.expense);
    $('metricBalance').className = 'metric-value ' + (net < 0 ? 'negative' : '');
    $('metricRate').textContent = result.income
      ? `${Math.round(net / result.income * 100)}%`
      : '0%';

    const monthData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthTotals = totals(transactions.filter(t => t.date.startsWith(key)));
      monthData.push({ label: monthLabel(date), ...monthTotals });
    }

    renderBars('flowChart', monthData);

    const expenseByCategory = {};

    list.filter(t => t.type === 'expense').forEach(transaction => {
      expenseByCategory[transaction.category] =
        (expenseByCategory[transaction.category] || 0) + Number(transaction.amount);
    });

    const entries = Object.entries(expenseByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const max = entries[0]?.[1] || 1;

    $('categoryChart').innerHTML = entries.length
      ? entries.map(([category, amount]) => {
          const meta = CATEGORY_META[category] || ['•', '#ddd'];

          return `
            <div class="category-row">
              <div class="category-icon">${meta[0]}</div>
              <div>
                <div class="category-name">${esc(category)}</div>
                <div class="progress">
                  <span style="width:${Math.max(4, amount / max * 100)}%"></span>
                </div>
              </div>
              <div class="category-amount">${money(amount)}</div>
            </div>
          `;
        }).join('')
      : '<div class="empty">Sem despesas neste período.</div>';

    const recent = [...list]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    $('recentTable').innerHTML = recent.length
      ? recent.map(t => `
          <tr>
            <td><div class="desc-cell"><span class="tx-icon">${t.type === 'income' ? '↗' : '↘'}</span>${esc(t.description)}</div></td>
            <td>${esc(t.category)}</td>
            <td>${dateLabel(t.date)}</td>
            <td><span class="pill ${t.type}">${t.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
            <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">${t.type === 'income' ? '+' : '−'} ${money(t.amount)}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="empty">Nenhum lançamento encontrado.</td></tr>';
  }

  function renderBars(id, data) {
    const max = Math.max(1, ...data.flatMap(item => [item.income, item.expense]));

    $(id).innerHTML = data.map(item => `
      <div class="bar-col">
        <div class="bar-pair" title="${esc(item.label)}: receitas ${money(item.income)} · despesas ${money(item.expense)}">
          <div class="bar income" style="height:${Math.max(2, item.income / max * 100)}%"></div>
          <div class="bar expense" style="height:${Math.max(2, item.expense / max * 100)}%"></div>
        </div>
        <div class="bar-label">${esc(item.label)}</div>
      </div>
    `).join('');
  }

  function renderTransactions() {
    const search = $('searchInput').value.trim().toLocaleLowerCase('pt-BR');
    const type = $('typeFilter').value;
    const category = $('categoryFilter').value;

    const list = [...transactions]
      .filter(t =>
        (!search
          || t.description.toLocaleLowerCase('pt-BR').includes(search)
          || (t.notes || '').toLocaleLowerCase('pt-BR').includes(search))
        && (type === 'all' || t.type === type)
        && (category === 'all' || t.category === category)
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    $('transactionsTable').innerHTML = list.length
      ? list.map(t => `
          <tr>
            <td><div class="desc-cell"><span class="tx-icon">${t.type === 'income' ? '↗' : '↘'}</span>${esc(t.description)}</div></td>
            <td>${esc(t.category)}</td>
            <td>${dateLabel(t.date)}</td>
            <td><span class="pill ${t.type}">${t.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
            <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">${t.type === 'income' ? '+' : '−'} ${money(t.amount)}</td>
            <td>
              <div class="actions">
                <button class="icon-btn" data-edit="${esc(t.id)}" aria-label="Editar ${esc(t.description)}">✎</button>
                <button class="icon-btn" data-delete="${esc(t.id)}" aria-label="Excluir ${esc(t.description)}">×</button>
              </div>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="6" class="empty">Nenhum lançamento encontrado. Tente alterar os filtros ou cadastre um novo.</td></tr>';

    $('transactionCount').textContent =
      `${list.length} ${list.length === 1 ? 'lançamento' : 'lançamentos'}`;

    refreshCategoryFilter();
  }

  function renderBudgets() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthExpenses = transactions.filter(t =>
      t.type === 'expense' && t.date.startsWith(month)
    );

    $('budgetList').innerHTML = budgets.length
      ? budgets.map(budget => {
          const spent = monthExpenses
            .filter(t => t.category === budget.category)
            .reduce((sum, t) => sum + Number(t.amount), 0);

          const percentage = budget.amount ? spent / budget.amount * 100 : 0;

          return `
            <div class="budget-card">
              <div class="budget-head">
                <strong>${esc(budget.category)}</strong>
                <button class="icon-btn" data-remove-budget="${esc(budget.category)}" aria-label="Remover orçamento de ${esc(budget.category)}">×</button>
              </div>
              <div class="budget-numbers">
                <span>${money(spent)} utilizados</span>
                <strong>${money(budget.amount)}</strong>
              </div>
              <div class="budget-progress">
                <span class="${percentage > 100 ? 'over' : ''}" style="width:${Math.min(100, percentage)}%"></span>
              </div>
              <div class="small-muted" style="margin-top:8px">
                ${percentage > 100
                  ? `Limite ultrapassado em ${money(spent - budget.amount)}`
                  : `${Math.round(percentage)}% do limite utilizado`}
              </div>
            </div>
          `;
        }).join('')
      : '<div class="empty">Nenhum orçamento cadastrado. Adicione um limite para começar.</div>';

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) =>
      sum + monthExpenses
        .filter(t => t.category === b.category)
        .reduce((value, t) => value + Number(t.amount), 0), 0
    );

    $('budgetTotal').textContent = money(totalBudget);
    $('budgetSpent').textContent = money(totalSpent);
    $('budgetRemaining').textContent = money(totalBudget - totalSpent);
    $('budgetRemaining').className = totalBudget - totalSpent < 0 ? 'negative' : '';
  }

  function renderReports() {
    const result = totals(getPeriodTransactions('all'));

    $('reportIncome').textContent = money(result.income);
    $('reportExpense').textContent = money(result.expense);
    $('reportNet').textContent = money(result.income - result.expense);
    $('reportNet').className = result.income - result.expense < 0 ? 'negative' : '';

    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthTotals = totals(transactions.filter(t => t.date.startsWith(key)));
      data.push({ label: monthLabel(date), ...monthTotals });
    }

    renderBars('reportChart', data);
  }

  const pageInfo = {
    dashboard: ['PAINEL FINANCEIRO', 'Visão geral', 'Acompanhe a saúde financeira do seu negócio.'],
    transactions: ['MOVIMENTAÇÕES', 'Lançamentos', 'Todas as entradas e saídas em um só lugar.'],
    budgets: ['PLANEJAMENTO', 'Orçamentos', 'Defina limites e acompanhe os gastos por categoria.'],
    reports: ['ANÁLISE FINANCEIRA', 'Relatórios', 'Transforme seus lançamentos em informação para decidir melhor.']
  };

  function go(page) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.toggle('active', section.id === page);
    });

    document.querySelectorAll('.nav button').forEach(button => {
      button.classList.toggle('active', button.dataset.page === page);
    });

    $('eyebrow').textContent = pageInfo[page][0];
    $('pageTitle').textContent = pageInfo[page][1];
    $('pageSub').textContent = pageInfo[page][2];
    $('sidebar').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openTransaction(transaction = null) {
    $('transactionForm').reset();
    $('editId').value = transaction?.id || '';
    $('modalTitle').textContent = transaction ? 'Editar lançamento' : 'Novo lançamento';

    categoryOptions($('txCategory'), transaction?.category || 'Serviços');

    $('description').value = transaction?.description || '';
    $('txType').value = transaction?.type || 'income';
    $('amount').value = transaction?.amount ?? '';
    $('txDate').value = transaction?.date || localDate();
    $('notes').value = transaction?.notes || '';

    $('transactionModal').classList.add('open');
    setTimeout(() => $('description').focus(), 50);
  }

  function closeTransaction() {
    $('transactionModal').classList.remove('open');
  }

  function openBudget() {
    categoryOptions($('budgetCategory'));
    $('budgetForm').reset();
    $('budgetModal').classList.add('open');
  }

  function closeBudget() {
    $('budgetModal').classList.remove('open');
  }

  function csvEscape(value) {
    return '"' + String(value ?? '').replace(/"/g, '""') + '"';
  }

  function exportCsv() {
    const header = ['Descrição', 'Tipo', 'Categoria', 'Data', 'Valor (R$)', 'Observações'];

    const rows = [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(t => [
        t.description,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.category,
        dateLabel(t.date),
        Number(t.amount).toFixed(2).replace('.', ','),
        t.notes
      ]);

    const csv = '\ufeff' + [header, ...rows]
      .map(row => row.map(csvEscape).join(';'))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'kompany-finance-lancamentos.csv';

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast('Arquivo CSV exportado!');
  }

  document.querySelectorAll('.nav button').forEach(button => {
    button.addEventListener('click', () => go(button.dataset.page));
  });

  document.querySelectorAll('[data-goto]').forEach(button => {
    button.addEventListener('click', () => go(button.dataset.goto));
  });

  $('mobileMenu').addEventListener('click', () => {
    $('sidebar').classList.toggle('open');
  });

  $('periodSelect').addEventListener('change', renderDashboard);
  $('quickAdd').addEventListener('click', () => openTransaction());
  $('addTransaction').addEventListener('click', () => openTransaction());

  $('closeModal').addEventListener('click', closeTransaction);
  $('cancelModal').addEventListener('click', closeTransaction);

  $('transactionModal').addEventListener('click', event => {
    if (event.target === $('transactionModal')) closeTransaction();
  });

  $('transactionForm').addEventListener('submit', event => {
    event.preventDefault();

    const id = $('editId').value;

    const transaction = {
      id: id || `tx_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      description: $('description').value.trim(),
      type: $('txType').value,
      category: $('txCategory').value,
      amount: Number($('amount').value),
      date: $('txDate').value,
      notes: $('notes').value.trim()
    };

    if (!transaction.description || !transaction.date
      || !Number.isFinite(transaction.amount) || transaction.amount <= 0) {
      toast('Confira os dados do lançamento.');
      return;
    }

    if (id) {
      transactions = transactions.map(item => item.id === id ? transaction : item);
      toast('Lançamento atualizado!');
    } else {
      transactions.push(transaction);
      toast('Lançamento cadastrado!');
    }

    saveTransactions();
    closeTransaction();
    render();
  });

  $('searchInput').addEventListener('input', renderTransactions);
  $('typeFilter').addEventListener('change', renderTransactions);
  $('categoryFilter').addEventListener('change', renderTransactions);

  $('transactionsTable').addEventListener('click', event => {
    const edit = event.target.closest('[data-edit]');
    const remove = event.target.closest('[data-delete]');

    if (edit) {
      const transaction = transactions.find(t => t.id === edit.dataset.edit);
      if (transaction) openTransaction(transaction);
    }

    if (remove) {
      const transaction = transactions.find(t => t.id === remove.dataset.delete);

      if (transaction && confirm(`Excluir o lançamento "${transaction.description}"?`)) {
        transactions = transactions.filter(t => t.id !== transaction.id);
        saveTransactions();
        render();
        toast('Lançamento excluído.');
      }
    }
  });

  $('exportCsv').addEventListener('click', exportCsv);
  $('reportCsv').addEventListener('click', exportCsv);
  $('printReport').addEventListener('click', () => window.print());

  $('addBudget').addEventListener('click', openBudget);
  $('closeBudgetModal').addEventListener('click', closeBudget);
  $('cancelBudget').addEventListener('click', closeBudget);

  $('budgetModal').addEventListener('click', event => {
    if (event.target === $('budgetModal')) closeBudget();
  });

  $('budgetForm').addEventListener('submit', event => {
    event.preventDefault();

    const category = $('budgetCategory').value;
    const amount = Number($('budgetAmount').value);

    if (!category || amount <= 0) {
      toast('Informe uma categoria e um limite válido.');
      return;
    }

    const existing = budgets.find(b => b.category === category);

    if (existing) {
      existing.amount = amount;
    } else {
      budgets.push({ category, amount });
    }

    saveBudgets();
    closeBudget();
    renderBudgets();
    toast('Orçamento salvo!');
  });

  $('budgetList').addEventListener('click', event => {
    const button = event.target.closest('[data-remove-budget]');

    if (button && confirm(`Remover o limite de ${button.dataset.removeBudget}?`)) {
      budgets = budgets.filter(b => b.category !== button.dataset.removeBudget);
      saveBudgets();
      renderBudgets();
      toast('Limite removido.');
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeTransaction();
      closeBudget();
      $('sidebar').classList.remove('open');
    }
  });

  render();
})();