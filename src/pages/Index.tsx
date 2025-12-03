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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/20 p-4 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
              <Icon name="Waves" size={32} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                Прачечная 2025
              </h1>
              <p className="text-slate-400">3D Симулятор бизнеса</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card 
            className="bg-gradient-to-br from-emerald-900/40 to-slate-800/50 border-2 border-emerald-500/30 backdrop-blur shadow-xl shadow-emerald-500/20"
            style={{ transform: 'perspective(800px) rotateY(-2deg)' }}
          >
            <CardHeader className="pb-3">
              <CardDescription className="text-emerald-300/80">Баланс</CardDescription>
              <CardTitle className="text-4xl text-emerald-400 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Icon name="Wallet" size={28} />
                </div>
                {money}₽
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-gradient-to-br from-cyan-900/40 to-slate-800/50 border-2 border-cyan-500/30 backdrop-blur shadow-xl shadow-cyan-500/20"
            style={{ transform: 'perspective(800px) rotateY(-1deg)' }}
          >
            <CardHeader className="pb-3">
              <CardDescription className="text-cyan-300/80">Репутация</CardDescription>
              <CardTitle className="text-4xl text-cyan-400 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Icon name="Star" size={28} />
                </div>
                {reputation}/100
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-gradient-to-br from-blue-900/40 to-slate-800/50 border-2 border-blue-500/30 backdrop-blur shadow-xl shadow-blue-500/20"
            style={{ transform: 'perspective(800px) rotateY(1deg)' }}
          >
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-300/80">Активных заказов</CardDescription>
              <CardTitle className="text-4xl text-blue-400 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Icon name="Clock" size={28} />
                </div>
                {activeOrders}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-900/40 to-slate-800/50 border-2 border-purple-500/30 backdrop-blur shadow-xl shadow-purple-500/20"
            style={{ transform: 'perspective(800px) rotateY(2deg)' }}
          >
            <CardHeader className="pb-3">
              <CardDescription className="text-purple-300/80">Всего клиентов</CardDescription>
              <CardTitle className="text-4xl text-purple-400 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Icon name="Users" size={28} />
                </div>
                {totalCustomers}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="machines" className="space-y-6">
          <TabsList className="bg-slate-800/80 border-2 border-slate-700/50 backdrop-blur-xl p-1.5 shadow-2xl">
            <TabsTrigger 
              value="machines" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/30 transition-all"
            >
              <Icon name="Waves" size={18} className="mr-2" />
              Оборудование
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/30 transition-all"
            >
              <Icon name="Star" size={18} className="mr-2" />
              Отзывы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="machines" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {machines.map(machine => (
                <Card
                  key={machine.id}
                  className={`bg-slate-800/70 border-2 backdrop-blur transition-all transform hover:scale-[1.02] ${
                    machine.status === 'running'
                      ? 'border-cyan-500 shadow-2xl shadow-cyan-500/30'
                      : machine.status === 'idle'
                      ? 'border-slate-600'
                      : 'border-orange-500'
                  }`}
                  style={{
                    transform: 'perspective(1000px) rotateX(2deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <CardHeader>
                    <div 
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-2xl shadow-2xl ${
                        machine.type === 'washer' 
                          ? 'bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600' 
                          : 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-600'
                      }`}
                      style={{
                        transform: 'perspective(600px) rotateY(-5deg) translateZ(20px)',
                        boxShadow: machine.status === 'running' 
                          ? '0 20px 50px -12px rgba(6, 182, 212, 0.5), inset 0 2px 20px rgba(255,255,255,0.2)'
                          : '0 20px 40px -12px rgba(0, 0, 0, 0.5), inset 0 2px 20px rgba(255,255,255,0.2)',
                      }}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div 
                          className={`absolute inset-3 rounded-xl border-4 ${
                            machine.type === 'washer' ? 'border-cyan-200/30' : 'border-orange-200/30'
                          } bg-slate-900/40 backdrop-blur-sm`}
                          style={{
                            animation: machine.status === 'running' ? 'spin 2s linear infinite' : 'none',
                          }}
                        >
                          <div className="w-full h-full rounded-lg bg-gradient-to-br from-white/10 to-transparent" />
                        </div>
                        <Icon 
                          name={machine.type === 'washer' ? 'Waves' : 'Wind'} 
                          size={40} 
                          className="text-white relative z-10 drop-shadow-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-24">
                      <div>
                        <CardTitle className="text-white text-2xl drop-shadow-lg">{machine.id}</CardTitle>
                        <CardDescription className="text-slate-300">
                          {machine.type === 'washer' ? 'Стиральная машина' : 'Сушильная машина'}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={machine.status === 'running' ? 'default' : 'secondary'}
                        className={`shadow-lg ${
                          machine.status === 'running'
                            ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 shadow-cyan-500/50 animate-pulse'
                            : 'bg-slate-700/50 text-slate-300 border-slate-500'
                        }`}
                      >
                        {machine.status === 'running' ? '● Работает' : '○ Свободна'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-slate-600/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                          <span className="text-cyan-400 font-bold text-sm">{machine.level}</span>
                        </div>
                        <span className="text-slate-300 font-medium">Уровень</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Package" size={16} className="text-slate-400" />
                        <span className="text-slate-300 font-medium">{machine.capacity} кг</span>
                      </div>
                    </div>

                    {machine.status === 'running' && machine.customer && (
                      <div className="space-y-3 p-4 bg-gradient-to-br from-slate-900/70 to-slate-800/70 rounded-xl border-2 border-cyan-500/30 shadow-xl shadow-cyan-500/10">
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

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => startMachine(machine.id)}
                        disabled={machine.status !== 'idle'}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:shadow-none transition-all transform hover:scale-[1.02]"
                        style={{
                          transform: 'perspective(400px) translateZ(5px)',
                        }}
                      >
                        <Icon name="Play" size={18} className="mr-2" />
                        Запустить
                      </Button>
                      <Button
                        onClick={() => upgradeMachine(machine.id)}
                        variant="outline"
                        className="border-2 border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.05]"
                        style={{
                          transform: 'perspective(400px) translateZ(5px)',
                        }}
                      >
                        <Icon name="ArrowUp" size={18} className="mr-1" />
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