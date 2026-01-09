
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  fCurrency: (value: number) => string;
  locale: string;
  currency: string;
}

const translations = {
  pt: {
    'nav.dashboard': 'Início',
    'nav.cards': 'Cartões',
    'nav.recurring': 'Fixas',
    'nav.investments': 'Cofres',
    'nav.reports': 'Relat.',
    'nav.settings': 'Config.',
    'dash.result': 'Resultado do Mês',
    'dash.income': 'Receitas',
    'dash.expense': 'Despesas',
    'dash.invoices': 'Faturas de',
    'dash.extract': 'Extrato de',
    'dash.closed': 'Fechada',
    'dash.open': 'Aberta',
    'dash.no_cards': 'Nenhum cartão cadastrado.',
    'dash.no_transactions': 'Nenhum lançamento este mês.',
    'rep.title': 'Despesas por Categoria',
    'rep.total': 'Total',
    'rep.daily': 'Evolução Diária',
    'rep.goals': 'Metas de Gastos',
    'rep.goals_desc': 'Planeje limites para não estourar o orçamento.',
    'rep.no_data': 'Sem dados este mês',
    'rep.exceeded': 'Você excedeu o limite em',
    'cards.title': 'Meus Cartões',
    'cards.new': 'Novo',
    'cards.available': 'Limite Disponível',
    'cards.invoice': 'Fatura Atual',
    'cards.pay': 'Pagar',
    'cards.no_purchases': 'Nenhuma compra nesta fatura.',
    'inv.title': 'Cofres & Investimentos',
    'inv.total': 'Total Guardado',
    'inv.desc': 'Soma de todos os cofrinhos e aplicações.',
    'inv.my_accounts': 'Minhas Contas',
    'inv.no_safes': 'Nenhum cofrinho criado.',
    'inv.start': 'Começar a guardar',
    'mod.new_tx': 'Nova Transação',
    'mod.edit_tx': 'Editar Transação',
    'mod.amount': 'Valor',
    'mod.desc': 'Descrição',
    'mod.cat': 'Categoria',
    'mod.date': 'Data',
    'mod.pay_method': 'Método de Pagamento',
    'mod.use_card': 'Usar Cartão de Crédito',
    'mod.acc_dest': 'Conta de Destino',
    'mod.acc_pay': 'Conta de Pagamento',
    'mod.save': 'Salvar',
    'mod.update': 'Atualizar',
    'mod.confirm_del': 'Tem certeza que deseja apagar?',
    'settings.title': 'Configurações',
    'settings.recurring_btn': 'Contas Fixas',
    'settings.recurring_desc': 'Gerenciar lançamentos recorrentes',
    'settings.logout': 'Sair da Conta',
    'settings.language': 'Idioma',
    'settings.language_desc': 'Altere o idioma do aplicativo',
    'premium.price': 'R$ 29,90'
  },
  en: {
    'nav.dashboard': 'Home',
    'nav.cards': 'Cards',
    'nav.recurring': 'Fixed',
    'nav.investments': 'Vaults',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'dash.result': 'Monthly Balance',
    'dash.income': 'Income',
    'dash.expense': 'Expenses',
    'dash.invoices': 'Invoices for',
    'dash.extract': 'Statement for',
    'dash.closed': 'Closed',
    'dash.open': 'Open',
    'dash.no_cards': 'No credit cards registered.',
    'dash.no_transactions': 'No transactions this month.',
    'rep.title': 'Expenses by Category',
    'rep.total': 'Total',
    'rep.daily': 'Daily Evolution',
    'rep.goals': 'Spending Goals',
    'rep.goals_desc': 'Set limits to stay within budget.',
    'rep.no_data': 'No data this month',
    'rep.exceeded': 'You exceeded the limit by',
    'cards.title': 'My Cards',
    'cards.new': 'New',
    'cards.available': 'Available Limit',
    'cards.invoice': 'Current Invoice',
    'cards.pay': 'Pay',
    'cards.no_purchases': 'No purchases in this invoice.',
    'inv.title': 'Vaults & Investments',
    'inv.total': 'Total Saved',
    'inv.desc': 'Sum of all savings and investments.',
    'inv.my_accounts': 'My Accounts',
    'inv.no_safes': 'No vaults created.',
    'inv.start': 'Start saving',
    'mod.new_tx': 'New Transaction',
    'mod.edit_tx': 'Edit Transaction',
    'mod.amount': 'Amount',
    'mod.desc': 'Description',
    'mod.cat': 'Category',
    'mod.date': 'Date',
    'mod.pay_method': 'Payment Method',
    'mod.use_card': 'Use Credit Card',
    'mod.acc_dest': 'Destination Account',
    'mod.acc_pay': 'Payment Account',
    'mod.save': 'Save',
    'mod.update': 'Update',
    'mod.confirm_del': 'Are you sure you want to delete?',
    'settings.title': 'Settings',
    'settings.recurring_btn': 'Fixed Bills',
    'settings.recurring_desc': 'Manage recurring payments',
    'settings.logout': 'Sign Out',
    'settings.language': 'Language',
    'settings.language_desc': 'Change application language',
    'premium.price': '$ 5.99'
  },
  es: {
    'nav.dashboard': 'Inicio',
    'nav.cards': 'Tarjetas',
    'nav.recurring': 'Fijas',
    'nav.investments': 'Cajas',
    'nav.reports': 'Informes',
    'nav.settings': 'Ajustes',
    'dash.result': 'Balance Mensual',
    'dash.income': 'Ingresos',
    'dash.expense': 'Gastos',
    'dash.invoices': 'Facturas de',
    'dash.extract': 'Extracto de',
    'dash.closed': 'Cerrada',
    'dash.open': 'Abierta',
    'dash.no_cards': 'Sin tarjetas registradas.',
    'dash.no_transactions': 'Sin transacciones este mes.',
    'rep.title': 'Gastos por Categoría',
    'rep.total': 'Total',
    'rep.daily': 'Evolución Diaria',
    'rep.goals': 'Metas de Gasto',
    'rep.goals_desc': 'Planifique límites para no exceder el presupuesto.',
    'rep.no_data': 'Sin datos este mes',
    'rep.exceeded': 'Ha excedido el límite en',
    'cards.title': 'Mis Tarjetas',
    'cards.new': 'Nuevo',
    'cards.available': 'Límite Disponible',
    'cards.invoice': 'Factura Actual',
    'cards.pay': 'Pagar',
    'cards.no_purchases': 'No hay compras en esta factura.',
    'inv.title': 'Cajas e Inversiones',
    'inv.total': 'Total Guardado',
    'inv.desc': 'Suma de todas las cajas y aplicaciones.',
    'inv.my_accounts': 'Mis Cuentas',
    'inv.no_safes': 'No hay cajas creadas.',
    'inv.start': 'Empezar a guardar',
    'mod.new_tx': 'Nueva Transacción',
    'mod.edit_tx': 'Editar Transacción',
    'mod.amount': 'Monto',
    'mod.desc': 'Descripción',
    'mod.cat': 'Categoría',
    'mod.date': 'Fecha',
    'mod.pay_method': 'Método de Pago',
    'mod.use_card': 'Usar Tarjeta de Crédito',
    'mod.acc_dest': 'Cuenta de Destino',
    'mod.acc_pay': 'Cuenta de Pago',
    'mod.save': 'Guardar',
    'mod.update': 'Actualizar',
    'mod.confirm_del': '¿Está seguro de que desea eliminar?',
    'settings.title': 'Configuración',
    'settings.recurring_btn': 'Cuentas Fijas',
    'settings.recurring_desc': 'Administrar pagos recurrentes',
    'settings.logout': 'Cerrar Sesión',
    'settings.language': 'Idioma',
    'settings.language_desc': 'Cambiar idioma de la aplicación',
    'premium.price': '€ 5,99'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && ['pt', 'en', 'es'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  const localeMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };
  const currencyMap = { pt: 'BRL', en: 'USD', es: 'EUR' };

  const locale = localeMap[language];
  const currency = currencyMap[language];

  const fCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, fCurrency, locale, currency }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
