import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Machine {
  id: string;
  type: 'washer' | 'dryer';
  status: 'idle' | 'running' | 'maintenance';
  progress: number;
  timeLeft: number;
  customer?: Customer;
  level: number;
  capacity: number;
}

interface Customer {
  id: string;
  name: string;
  requirements: string[];
  satisfaction: number;
  payment: number;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  time: string;
}

export default function Index() {
  const { toast } = useToast();
  const [money, setMoney] = useState(1000);
  const [reputation, setReputation] = useState(50);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [machines, setMachines] = useState<Machine[]>([
    { id: 'W1', type: 'washer', status: 'idle', progress: 0, timeLeft: 0, level: 1, capacity: 5 },
    { id: 'W2', type: 'washer', status: 'idle', progress: 0, timeLeft: 0, level: 1, capacity: 5 },
    { id: 'W3', type: 'washer', status: 'idle', progress: 0, timeLeft: 0, level: 2, capacity: 8 },
    { id: 'D1', type: 'dryer', status: 'idle', progress: 0, timeLeft: 0, level: 1, capacity: 5 },
    { id: 'D2', type: 'dryer', status: 'idle', progress: 0, timeLeft: 0, level: 1, capacity: 5 },
  ]);
  const [reviews, setReviews] = useState<Review[]>([
    { id: '1', customerName: 'Анна М.', rating: 5, comment: 'Отличный сервис! Белье идеально чистое', time: '2 часа назад' },
    { id: '2', customerName: 'Петр К.', rating: 4, comment: 'Быстро и качественно, но хотелось бы больше машин', time: '5 часов назад' },
  ]);

  const customerNames = ['Мария', 'Иван', 'Елена', 'Дмитрий', 'Ольга', 'Сергей', 'Анастасия', 'Андрей'];
  const requirements = [
    'Деликатная стирка',
    'Быстрый режим',
    'Удаление пятен',
    'Эко-режим',
    'Отбеливание',
    'Максимальная загрузка',
  ];

  const generateCustomer = (): Customer => {
    const numRequirements = Math.floor(Math.random() * 2) + 1;
    const selectedReqs = [];
    for (let i = 0; i < numRequirements; i++) {
      const req = requirements[Math.floor(Math.random() * requirements.length)];
      if (!selectedReqs.includes(req)) selectedReqs.push(req);
    }
    
    return {
      id: `C${Date.now()}`,
      name: customerNames[Math.floor(Math.random() * customerNames.length)],
      requirements: selectedReqs,
      satisfaction: 100,
      payment: 150 + Math.floor(Math.random() * 150),
    };
  };

  const startMachine = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine || machine.status !== 'idle') return;

    const customer = generateCustomer();
    const duration = 30 + Math.floor(Math.random() * 30);

    setMachines(prev =>
      prev.map(m =>
        m.id === machineId
          ? { ...m, status: 'running', progress: 0, timeLeft: duration, customer }
          : m
      )
    );

    setTotalCustomers(prev => prev + 1);
    
    toast({
      title: '🧺 Новый клиент',
      description: `${customer.name} — ${customer.requirements.join(', ')}`,
    });
  };

  const upgradeMachine = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;

    const upgradeCost = machine.level * 500;
    if (money < upgradeCost) {
      toast({
        title: '❌ Недостаточно средств',
        description: `Требуется ${upgradeCost}₽ для улучшения`,
        variant: 'destructive',
      });
      return;
    }

    setMoney(prev => prev - upgradeCost);
    setMachines(prev =>
      prev.map(m =>
        m.id === machineId
          ? { ...m, level: m.level + 1, capacity: m.capacity + 3 }
          : m
      )
    );

    toast({
      title: '⬆️ Улучшение выполнено',
      description: `${machineId} улучшен до уровня ${machine.level + 1}`,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prev =>
        prev.map(machine => {
          if (machine.status === 'running') {
            const newTimeLeft = machine.timeLeft - 1;
            const newProgress = 100 - (newTimeLeft / (30 + Math.floor(Math.random() * 30))) * 100;

            if (newTimeLeft <= 0) {
              if (machine.customer) {
                const satisfactionBonus = machine.level * 5;
                const finalSatisfaction = Math.min(100, machine.customer.satisfaction + satisfactionBonus);
                const payment = Math.floor(machine.customer.payment * (finalSatisfaction / 100));
                
                setMoney(m => m + payment);
                setReputation(r => Math.min(100, r + Math.floor(finalSatisfaction / 20)));

                const newReview: Review = {
                  id: `R${Date.now()}`,
                  customerName: machine.customer.name,
                  rating: Math.ceil(finalSatisfaction / 20),
                  comment: finalSatisfaction > 80 ? 'Превосходное качество!' : 'Хорошо, но можно лучше',
                  time: 'только что',
                };
                setReviews(r => [newReview, ...r.slice(0, 9)]);

                toast({
                  title: '✅ Заказ выполнен',
                  description: `${machine.customer.name} оплатил ${payment}₽`,
                });
              }

              return { ...machine, status: 'idle', progress: 0, timeLeft: 0, customer: undefined };
            }

            return { ...machine, progress: Math.min(100, newProgress), timeLeft: newTimeLeft };
          }
          return machine;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [toast]);

  const activeOrders = machines.filter(m => m.status === 'running').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/20 p-4 rounded-2xl border border-cyan-500/30">
              <Icon name="Waves" size={32} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Прачечная 2025</h1>
              <p className="text-slate-400">Управляй своим бизнесом</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Баланс</CardDescription>
              <CardTitle className="text-3xl text-emerald-400 flex items-center gap-2">
                <Icon name="Wallet" size={28} />
                {money}₽
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Репутация</CardDescription>
              <CardTitle className="text-3xl text-cyan-400 flex items-center gap-2">
                <Icon name="Star" size={28} />
                {reputation}/100
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Активных заказов</CardDescription>
              <CardTitle className="text-3xl text-blue-400 flex items-center gap-2">
                <Icon name="Clock" size={28} />
                {activeOrders}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Всего клиентов</CardDescription>
              <CardTitle className="text-3xl text-purple-400 flex items-center gap-2">
                <Icon name="Users" size={28} />
                {totalCustomers}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="machines" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="machines" className="data-[state=active]:bg-cyan-500/20">
              <Icon name="Waves" size={18} className="mr-2" />
              Оборудование
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-cyan-500/20">
              <Icon name="Star" size={18} className="mr-2" />
              Отзывы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="machines" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machines.map(machine => (
                <Card
                  key={machine.id}
                  className={`bg-slate-800/70 border-2 backdrop-blur transition-all ${
                    machine.status === 'running'
                      ? 'border-cyan-500 shadow-lg shadow-cyan-500/20'
                      : machine.status === 'idle'
                      ? 'border-slate-600'
                      : 'border-orange-500'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${
                          machine.type === 'washer' 
                            ? 'bg-cyan-500/20 text-cyan-400' 
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          <Icon name={machine.type === 'washer' ? 'Waves' : 'Wind'} size={24} />
                        </div>
                        <div>
                          <CardTitle className="text-white">{machine.id}</CardTitle>
                          <CardDescription>
                            {machine.type === 'washer' ? 'Стиральная' : 'Сушильная'}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={machine.status === 'running' ? 'default' : 'secondary'}
                        className={
                          machine.status === 'running'
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500'
                            : 'bg-slate-700 text-slate-300'
                        }
                      >
                        {machine.status === 'running' ? 'Работает' : 'Свободна'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Уровень {machine.level}</span>
                      <span className="text-slate-400">Загрузка {machine.capacity} кг</span>
                    </div>

                    {machine.status === 'running' && machine.customer && (
                      <div className="space-y-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2">
                          <Icon name="User" size={16} className="text-cyan-400" />
                          <span className="text-white font-medium">{machine.customer.name}</span>
                        </div>
                        <div className="space-y-1">
                          {machine.customer.requirements.map(req => (
                            <div key={req} className="flex items-center gap-2 text-xs">
                              <Icon name="Check" size={14} className="text-emerald-400" />
                              <span className="text-slate-300">{req}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Прогресс</span>
                            <span className="text-cyan-400">{Math.floor(machine.progress)}%</span>
                          </div>
                          <Progress value={machine.progress} className="h-2 bg-slate-700" />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              <Icon name="Clock" size={12} className="inline mr-1" />
                              {machine.timeLeft} сек
                            </span>
                            <span className="text-xs text-emerald-400">
                              +{machine.customer.payment}₽
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => startMachine(machine.id)}
                        disabled={machine.status !== 'idle'}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Icon name="Play" size={16} className="mr-2" />
                        Запустить
                      </Button>
                      <Button
                        onClick={() => upgradeMachine(machine.id)}
                        variant="outline"
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        <Icon name="ArrowUp" size={16} className="mr-1" />
                        {machine.level * 500}₽
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Icon name="MessageSquare" size={24} className="text-cyan-400" />
                  Отзывы клиентов
                </CardTitle>
                <CardDescription>Что говорят о вашей прачечной</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map(review => (
                  <div
                    key={review.id}
                    className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {review.customerName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">{review.customerName}</p>
                          <p className="text-xs text-slate-400">{review.time}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            name="Star"
                            size={16}
                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{review.comment}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}