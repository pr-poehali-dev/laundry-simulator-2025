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
  laundryLoad: number;
}

interface Customer {
  id: string;
  name: string;
  requirements: string[];
  satisfaction: number;
  payment: number;
  laundryAmount: number;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  time: string;
}

interface InventoryItem {
  id: string;
  name: string;
  type: 'detergent' | 'softener' | 'bleach';
  quantity: number;
  price: number;
  icon: string;
}

type CameraView = 'first-person' | 'third-person' | 'isometric';

export default function Index() {
  const { toast } = useToast();
  const [cameraView, setCameraView] = useState<CameraView>('third-person');
  const [money, setMoney] = useState(1000);
  const [reputation, setReputation] = useState(50);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [machines, setMachines] = useState<Machine[]>([
    { id: 'W1', type: 'washer', status: 'idle', progress: 0, timeLeft: 0, level: 1, capacity: 5, laundryLoad: 0 },
    { id: 'W2', type: 'washer', status: 'idle', progress: 0, timeLeft: 0, level: 1, capacity: 5, laundryLoad: 0 },
    { id: 'W3', type: 'washer', status: 'idle', progress: 0, timeLeft: 0, level: 2, capacity: 8, laundryLoad: 0 },
    { id: 'D1', type: 'dryer', status: 'idle', progress: 0, timeLeft: 0, level: 1, capacity: 5, laundryLoad: 0 },
    { id: 'D2', type: 'dryer', status: 'idle', progress: 0, timeLeft: 0, level: 1, capacity: 5, laundryLoad: 0 },
  ]);
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Порошок', type: 'detergent', quantity: 50, price: 100, icon: 'Package' },
    { id: '2', name: 'Кондиционер', type: 'softener', quantity: 30, price: 150, icon: 'Droplets' },
    { id: '3', name: 'Отбеливатель', type: 'bleach', quantity: 20, price: 120, icon: 'Sparkles' },
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
    
    const laundryAmount = 2 + Math.floor(Math.random() * 4);
    
    return {
      id: `C${Date.now()}`,
      name: customerNames[Math.floor(Math.random() * customerNames.length)],
      requirements: selectedReqs,
      satisfaction: 100,
      payment: 150 + Math.floor(Math.random() * 150),
      laundryAmount,
    };
  };

  const loadLaundry = (machineId: string, amount: number) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine || machine.status !== 'idle') return;

    if (amount > machine.capacity) {
      toast({
        title: '❌ Перегрузка',
        description: `Максимум ${machine.capacity} кг для этой машины`,
        variant: 'destructive',
      });
      return;
    }

    setMachines(prev =>
      prev.map(m =>
        m.id === machineId ? { ...m, laundryLoad: amount } : m
      )
    );

    toast({
      title: '✅ Белье загружено',
      description: `${amount} кг в машину ${machineId}`,
    });
  };

  const startMachine = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine || machine.status !== 'idle') return;

    if (machine.laundryLoad === 0) {
      toast({
        title: '❌ Загрузите белье',
        description: 'Сначала добавьте белье в машину',
        variant: 'destructive',
      });
      return;
    }

    const detergentNeeded = Math.ceil(machine.laundryLoad / 2);
    const detergent = inventory.find(i => i.type === 'detergent');
    
    if (!detergent || detergent.quantity < detergentNeeded) {
      toast({
        title: '❌ Нет порошка',
        description: `Требуется ${detergentNeeded} ед. порошка`,
        variant: 'destructive',
      });
      return;
    }

    setInventory(prev =>
      prev.map(i =>
        i.type === 'detergent' ? { ...i, quantity: i.quantity - detergentNeeded } : i
      )
    );

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
      title: '🧺 Стирка запущена',
      description: `${customer.name} — ${customer.laundryAmount} кг белья`,
    });
  };

  const buyInventoryItem = (itemId: string, amount: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const cost = item.price * amount;
    if (money < cost) {
      toast({
        title: '❌ Недостаточно средств',
        description: `Требуется ${cost}₽`,
        variant: 'destructive',
      });
      return;
    }

    setMoney(prev => prev - cost);
    setInventory(prev =>
      prev.map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity + amount } : i
      )
    );

    toast({
      title: '✅ Товар куплен',
      description: `${item.name} +${amount} ед.`,
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
          ? { ...m, level: m.level + 1, capacity: m.capacity + 3, laundryLoad: 0 }
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

              return { ...machine, status: 'idle', progress: 0, timeLeft: 0, customer: undefined, laundryLoad: 0 };
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

  const getBackgroundStyle = () => {
    if (cameraView === 'first-person') {
      return 'min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950';
    } else if (cameraView === 'isometric') {
      return 'min-h-screen bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950';
    }
    return 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950';
  };

  return (
    <div className={`${getBackgroundStyle()} transition-all duration-700`}>
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-cyan-500/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
              <Icon name="Waves" size={24} className="text-cyan-400 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                Прачечная 2025
              </h1>
              <p className="text-sm sm:text-base text-slate-400">3D Симулятор бизнеса</p>
            </div>
          </div>
          
          <div className="flex gap-2 bg-slate-800/80 p-1.5 rounded-xl border-2 border-slate-700/50 backdrop-blur">
            <Button
              onClick={() => setCameraView('first-person')}
              variant={cameraView === 'first-person' ? 'default' : 'ghost'}
              size="sm"
              className={`${
                cameraView === 'first-person'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              } transition-all`}
            >
              <Icon name="Eye" size={16} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">От 1-го лица</span>
              <span className="sm:hidden">1P</span>
            </Button>
            <Button
              onClick={() => setCameraView('third-person')}
              variant={cameraView === 'third-person' ? 'default' : 'ghost'}
              size="sm"
              className={`${
                cameraView === 'third-person'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              } transition-all`}
            >
              <Icon name="Video" size={16} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Обзор</span>
              <span className="sm:hidden">3P</span>
            </Button>
            <Button
              onClick={() => setCameraView('isometric')}
              variant={cameraView === 'isometric' ? 'default' : 'ghost'}
              size="sm"
              className={`${
                cameraView === 'isometric'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              } transition-all`}
            >
              <Icon name="Cuboid" size={16} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Изометрия</span>
              <span className="sm:hidden">ISO</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card 
            className="bg-gradient-to-br from-emerald-900/40 to-slate-800/50 border-2 border-emerald-500/30 backdrop-blur shadow-xl shadow-emerald-500/20"
            style={{ transform: 'perspective(800px) rotateY(-2deg)' }}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm text-emerald-300/80">Баланс</CardDescription>
              <CardTitle className="text-xl sm:text-4xl text-emerald-400 flex items-center gap-2 sm:gap-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Icon name="Wallet" size={20} className="sm:w-7 sm:h-7" />
                </div>
                <span className="truncate">{money}₽</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-gradient-to-br from-cyan-900/40 to-slate-800/50 border-2 border-cyan-500/30 backdrop-blur shadow-xl shadow-cyan-500/20"
            style={{ transform: 'perspective(800px) rotateY(-1deg)' }}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm text-cyan-300/80">Репутация</CardDescription>
              <CardTitle className="text-xl sm:text-4xl text-cyan-400 flex items-center gap-2 sm:gap-3 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Icon name="Star" size={20} className="sm:w-7 sm:h-7" />
                </div>
                <span className="truncate">{reputation}/100</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-gradient-to-br from-blue-900/40 to-slate-800/50 border-2 border-blue-500/30 backdrop-blur shadow-xl shadow-blue-500/20"
            style={{ transform: 'perspective(800px) rotateY(1deg)' }}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm text-blue-300/80">Заказов</CardDescription>
              <CardTitle className="text-xl sm:text-4xl text-blue-400 flex items-center gap-2 sm:gap-3 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Icon name="Clock" size={20} className="sm:w-7 sm:h-7" />
                </div>
                {activeOrders}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-900/40 to-slate-800/50 border-2 border-purple-500/30 backdrop-blur shadow-xl shadow-purple-500/20"
            style={{ transform: 'perspective(800px) rotateY(2deg)' }}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm text-purple-300/80">Клиентов</CardDescription>
              <CardTitle className="text-xl sm:text-4xl text-purple-400 flex items-center gap-2 sm:gap-3 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Icon name="Users" size={20} className="sm:w-7 sm:h-7" />
                </div>
                {totalCustomers}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="machines" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-slate-800/80 border-2 border-slate-700/50 backdrop-blur-xl p-1 sm:p-1.5 shadow-2xl w-full sm:w-auto grid grid-cols-3">
            <TabsTrigger 
              value="machines" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/30 transition-all text-xs sm:text-sm"
            >
              <Icon name="Waves" size={16} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Оборудование</span>
              <span className="sm:hidden">Машины</span>
            </TabsTrigger>
            <TabsTrigger 
              value="inventory" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/30 transition-all text-xs sm:text-sm"
            >
              <Icon name="Package" size={16} className="mr-1 sm:mr-2" />
              Инвентарь
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/30 transition-all text-xs sm:text-sm"
            >
              <Icon name="Star" size={16} className="mr-1 sm:mr-2" />
              Отзывы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="machines" className="space-y-4 sm:space-y-6 mt-4 sm:mt-8">
            {cameraView === 'first-person' && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 sm:p-4 mb-4 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Icon name="Eye" size={20} className="text-cyan-400" />
                  <span className="text-cyan-300 text-sm sm:text-base font-medium">
                    Режим от первого лица — детальный обзор каждой машины
                  </span>
                </div>
              </div>
            )}
            {cameraView === 'isometric' && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 sm:p-4 mb-4 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Icon name="Cuboid" size={20} className="text-purple-400" />
                  <span className="text-purple-300 text-sm sm:text-base font-medium">
                    Изометрический вид — полный обзор всей прачечной
                  </span>
                </div>
              </div>
            )}
            {cameraView === 'third-person' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-4 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Icon name="Video" size={20} className="text-blue-400" />
                  <span className="text-blue-300 text-sm sm:text-base font-medium">
                    Режим обзора — сбалансированный вид для управления
                  </span>
                </div>
              </div>
            )}
            <div 
              className={`grid gap-4 sm:gap-8 transition-all duration-500 ${
                cameraView === 'first-person'
                  ? 'grid-cols-1 max-w-2xl mx-auto'
                  : cameraView === 'third-person'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              }`}
              style={{
                perspective: cameraView === 'first-person' ? '800px' : cameraView === 'third-person' ? '1200px' : '1500px',
              }}
            >
              {machines.map((machine, index) => {
                const getCameraTransform = () => {
                  if (cameraView === 'first-person') {
                    return {
                      transform: `perspective(800px) rotateX(5deg) scale(1.1)`,
                      transformStyle: 'preserve-3d' as const,
                    };
                  } else if (cameraView === 'third-person') {
                    return {
                      transform: 'perspective(1000px) rotateX(2deg)',
                      transformStyle: 'preserve-3d' as const,
                    };
                  } else {
                    return {
                      transform: `perspective(1500px) rotateX(35deg) rotateZ(${index % 2 === 0 ? -5 : 5}deg)`,
                      transformStyle: 'preserve-3d' as const,
                    };
                  }
                };

                return (
                <Card
                  key={machine.id}
                  className={`bg-slate-800/70 border-2 backdrop-blur transition-all hover:scale-[1.02] ${
                    machine.status === 'running'
                      ? 'border-cyan-500 shadow-2xl shadow-cyan-500/30'
                      : machine.status === 'idle'
                      ? 'border-slate-600'
                      : 'border-orange-500'
                  }`}
                  style={getCameraTransform()}
                >
                  <CardHeader>
                    <div 
                      className={`absolute ${
                        cameraView === 'first-person' 
                          ? '-top-12 w-40 h-40' 
                          : cameraView === 'isometric'
                          ? '-top-4 w-20 h-20'
                          : '-top-6 sm:-top-8 w-24 h-24 sm:w-32 sm:h-32'
                      } left-1/2 -translate-x-1/2 rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-500 ${
                        machine.type === 'washer' 
                          ? 'bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600' 
                          : 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-600'
                      }`}
                      style={{
                        transform: cameraView === 'first-person'
                          ? 'perspective(600px) rotateY(0deg) translateZ(40px)'
                          : cameraView === 'isometric'
                          ? 'perspective(600px) rotateY(-15deg) translateZ(15px)'
                          : 'perspective(600px) rotateY(-5deg) translateZ(20px)',
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
                          size={cameraView === 'first-person' ? 48 : cameraView === 'isometric' ? 24 : 32}
                          className={`text-white relative z-10 drop-shadow-lg ${
                            cameraView === 'first-person' ? '' : 'sm:w-10 sm:h-10'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between ${
                      cameraView === 'first-person' 
                        ? 'pt-32' 
                        : cameraView === 'isometric'
                        ? 'pt-12'
                        : 'pt-16 sm:pt-24'
                    }`}>
                      <div>
                        <CardTitle className="text-white text-xl sm:text-2xl drop-shadow-lg">{machine.id}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-slate-300">
                          {machine.type === 'washer' ? 'Стиральная' : 'Сушильная'}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={machine.status === 'running' ? 'default' : 'secondary'}
                        className={`shadow-lg text-xs ${
                          machine.status === 'running'
                            ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 shadow-cyan-500/50 animate-pulse'
                            : 'bg-slate-700/50 text-slate-300 border-slate-500'
                        }`}
                      >
                        <span className="hidden sm:inline">{machine.status === 'running' ? '● Работает' : '○ Свободна'}</span>
                        <span className="sm:hidden">{machine.status === 'running' ? '●' : '○'}</span>
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

                    {machine.status === 'idle' && machine.laundryLoad === 0 && (
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-900/30 to-slate-800/30 rounded-xl border-2 border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="ShoppingBag" size={16} className="text-purple-400" />
                          <span className="text-sm font-medium text-purple-300">Загрузить белье</span>
                        </div>
                        <div className="flex gap-2">
                          {[2, 3, 5].map(amount => (
                            <Button
                              key={amount}
                              onClick={() => loadLaundry(machine.id, amount)}
                              size="sm"
                              className="flex-1 bg-purple-600/50 hover:bg-purple-600 text-white text-xs sm:text-sm"
                            >
                              {amount} кг
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {machine.status === 'idle' && machine.laundryLoad > 0 && (
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-900/30 to-slate-800/30 rounded-xl border-2 border-emerald-500/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon name="CheckCircle" size={16} className="text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-300">Белье загружено</span>
                          </div>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500">
                            {machine.laundryLoad} кг
                          </Badge>
                        </div>
                      </div>
                    )}

                    {machine.status === 'running' && machine.customer && (
                      <div className="space-y-3 p-3 sm:p-4 bg-gradient-to-br from-slate-900/70 to-slate-800/70 rounded-xl border-2 border-cyan-500/30 shadow-xl shadow-cyan-500/10">
                        <div className="flex items-center gap-2">
                          <Icon name="User" size={16} className="text-cyan-400" />
                          <span className="text-sm sm:text-base text-white font-medium">{machine.customer.name}</span>
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

                    <div className="flex gap-2 sm:gap-3 pt-2">
                      <Button
                        onClick={() => startMachine(machine.id)}
                        disabled={machine.status !== 'idle'}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:shadow-none transition-all text-xs sm:text-sm"
                        size="sm"
                      >
                        <Icon name="Play" size={16} className="mr-1 sm:mr-2" />
                        Запустить
                      </Button>
                      <Button
                        onClick={() => upgradeMachine(machine.id)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/20 transition-all text-xs sm:text-sm"
                      >
                        <Icon name="ArrowUp" size={16} className="mr-1" />
                        <span className="hidden sm:inline">{machine.level * 500}₽</span>
                        <span className="sm:hidden">↑</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 sm:space-y-6 mt-4 sm:mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map(item => {
                const isLow = item.quantity < 10;
                return (
                  <Card
                    key={item.id}
                    className={`bg-slate-800/70 border-2 backdrop-blur transition-all ${
                      isLow ? 'border-red-500/50 shadow-lg shadow-red-500/20' : 'border-slate-600'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${
                            item.type === 'detergent'
                              ? 'bg-blue-500/20 text-blue-400'
                              : item.type === 'softener'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            <Icon name={item.icon as any} size={24} />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg sm:text-xl">{item.name}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              {item.type === 'detergent' ? 'Стиральный порошок' : item.type === 'softener' ? 'Кондиционер' : 'Отбеливатель'}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-slate-600/50">
                        <div className="flex items-center gap-2">
                          <Icon name="Box" size={16} className="text-slate-400" />
                          <span className="text-slate-300 text-sm">В наличии</span>
                        </div>
                        <Badge className={`${
                          isLow
                            ? 'bg-red-500/20 text-red-400 border-red-500'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        }`}>
                          {item.quantity} ед.
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-900/20 to-slate-800/30 border border-amber-500/30">
                        <span className="text-amber-300 text-sm font-medium">Цена за единицу</span>
                        <span className="text-amber-400 font-bold">{item.price}₽</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="ShoppingCart" size={16} className="text-cyan-400" />
                          <span className="text-sm font-medium text-cyan-300">Купить</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[5, 10, 20].map(amount => (
                            <Button
                              key={amount}
                              onClick={() => buyInventoryItem(item.id, amount)}
                              size="sm"
                              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg text-xs"
                            >
                              <span className="flex flex-col items-center leading-tight">
                                <span className="font-bold">+{amount}</span>
                                <span className="text-[10px] opacity-80">{amount * item.price}₽</span>
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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