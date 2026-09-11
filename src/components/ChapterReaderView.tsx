import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Share2,
  Flame,
  Clock,
  Calendar,
  Lightbulb,
  Check,
  FileText,
  Link as LinkIcon,
  BookOpen,
  Crown,
  Star,
  Sparkles,
  PenTool,
  Maximize2,
  Zap,
} from 'lucide-react';
import {
  CurriculumChapter,
  SupportedLanguage,
  UserSettings,
} from '../types';
import { CURRICULUM_MODULES, CURRICULUM_CHAPTERS } from '../data/curriculumData';
import { CodeStudio } from './CodeStudio';
import { NotesModal } from './NotesModal';
import { UMLModal } from './UMLModal';
import { AskAIDrawer } from './AskAIDrawer';

interface ChapterReaderViewProps {
  currentChapterId: string;
  completedChapterIds: string[];
  starredChapterIds: string[];
  chapterNotes: Record<string, string>;
  selectedLanguage: SupportedLanguage;
  settings: UserSettings;
  onSelectChapter: (chapterId: string) => void;
  onToggleComplete: (chapterId: string) => void;
  onToggleStar: (chapterId: string) => void;
  onSaveNote: (chapterId: string, note: string) => void;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onBackToHome: () => void;
  onNavigateToPractice?: (problemId: string) => void;
}

// Helper to render inline markdown tokens like bold and code
const renderInlineTokens = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\$\$.*?\$\$)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return (
        <span key={index} style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)', fontWeight: 600 }}>
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
};

// Helper to render markdown content with headings, lists, and callouts
const renderFormattedBlock = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: '4px' }} />;
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '12px', marginBottom: '2px' }}>
              {trimmed.substring(4)}
            </h3>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '4px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--brand-primary)', marginTop: '8px', flexShrink: 0 }} />
              <div>{renderInlineTokens(trimmed.substring(2))}</div>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s(.*)$/);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--brand-primary)', minWidth: '18px' }}>{match ? match[1] : '•'}</span>
              <div>{renderInlineTokens(match ? match[2] : trimmed)}</div>
            </div>
          );
        }
        if (trimmed.startsWith('> ')) {
          return (
            <div key={i} style={{ padding: '10px 14px', borderLeft: '3px solid var(--brand-primary)', background: 'var(--brand-primary-subtle)', borderRadius: '0 8px 8px 0', fontStyle: 'italic', color: 'var(--text-primary)' }}>
              {renderInlineTokens(trimmed.substring(2))}
            </div>
          );
        }
        return <p key={i}>{renderInlineTokens(trimmed)}</p>;
      })}
    </div>
  );
};

export const ChapterReaderView: React.FC<ChapterReaderViewProps> = ({
  currentChapterId,
  completedChapterIds,
  starredChapterIds,
  chapterNotes,
  selectedLanguage,
  settings,
  onSelectChapter,
  onToggleComplete,
  onToggleStar,
  onSaveNote,
  onSelectLanguage,
  onBackToHome,
  onNavigateToPractice,
}) => {
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    oop: true,
    'design-principles': false,
    uml: false,
    'creational-patterns': false,
    'structural-patterns': false,
    'behavioral-patterns': false,
    'interview-tips': false,
    'questions-easy': false,
    'questions-medium': false,
    'questions-hard': false,
  });

  // Track active section for table of contents
  const [activeTocId, setActiveTocId] = useState<string>('sec-1');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isUMLOpen, setIsUMLOpen] = useState(false);
  const [isAskAIOpen, setIsAskAIOpen] = useState(false);

  // Concept check quiz state
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Interactive Heap Visualizer State
  const [corollaSpeed, setCorollaSpeed] = useState<number>(20);
  const [mustangSpeed, setMustangSpeed] = useState<number>(40);
  const [heapLog, setHeapLog] = useState<string>(
    "State Independence: Modifying corolla.accelerate(20) does not alter mustang's memory."
  );
  const [lastMutated, setLastMutated] = useState<'corolla' | 'mustang' | null>(null);

  // Interactive Interfaces Visualizer State
  const [activeRemoteDevice, setActiveRemoteDevice] = useState<'tv' | 'soundbar' | 'projector'>('tv');
  const [remoteOutput, setRemoteOutput] = useState<string>(
    'TV: Rendering 4K HDR video stream via play()'
  );
  const [activeGateway, setActiveGateway] = useState<'stripe' | 'razorpay'>('stripe');
  const [paymentAmount, setPaymentAmount] = useState<number>(100);
  const [paymentOutput, setPaymentOutput] = useState<string>(
    'Processing payment via Stripe: $100.0'
  );
  const [notifiedChapters, setNotifiedChapters] = useState<string[]>([]);

  const chapter: CurriculumChapter =
    CURRICULUM_CHAPTERS[currentChapterId] || CURRICULUM_CHAPTERS['classes-and-objects'];

  // Calculate previous and next chapters for navigation dock
  const allChapterIds = CURRICULUM_MODULES.flatMap((m) => m.chapterIds);
  const currentIndex = allChapterIds.indexOf(chapter.id);
  const prevChapterId = currentIndex > 0 ? allChapterIds[currentIndex - 1] : null;
  const nextChapterId =
    currentIndex < allChapterIds.length - 1 ? allChapterIds[currentIndex + 1] : null;

  const prevChapter = prevChapterId ? CURRICULUM_CHAPTERS[prevChapterId] : null;
  const nextChapter = nextChapterId ? CURRICULUM_CHAPTERS[nextChapterId] : null;

  // Auto-expand current module in the syllabus
  useEffect(() => {
    if (chapter.moduleId) {
      setOpenModules((prev) => ({ ...prev, [chapter.moduleId]: true }));
    }
  }, [chapter.moduleId]);

  const toggleModuleAccordion = (modId: string) => {
    setOpenModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const totalCompleted = completedChapterIds.length;
  const totalChapters = 80;
  const overallPercent = Math.round((totalCompleted / totalChapters) * 100);

  const currentMod = CURRICULUM_MODULES.find((m) => m.id === chapter.moduleId);
  const relatedConcepts = currentMod
    ? currentMod.chapterIds
        .filter((id) => id !== chapter.id)
        .slice(0, 5)
        .map((id) => {
          const ch = CURRICULUM_CHAPTERS[id];
          return ch ? { title: ch.title, id: ch.id } : null;
        })
        .filter(Boolean) as Array<{ title: string; id: string }>
    : [
        { title: 'Classes and Objects', id: 'classes-and-objects' },
        { title: 'Interfaces', id: 'interfaces' },
        { title: 'SOLID Principles', id: 'solid-summary' },
        { title: 'Design Patterns', id: 'singleton' },
      ];

  // Multi-language code snippets for the chapter
  const carClassSnippets: Record<SupportedLanguage, string> = {
    java: `public class Car {
    // Attributes
    private String brand;
    private String model;
    private int speed;

    // Constructor
    public Car(String brand, String model) {
        this.brand = brand;
        this.model = model;
        this.speed = 0;
    }

    // Method to accelerate
    public void accelerate(int increment) {
        speed += increment;
    }

    // Method to display info
    public void displayStatus() {
        System.out.println(brand + " " + model + " is running at " + speed + " km/h.");
    }
}`,
    python: `class Car:
    # Constructor
    def __init__(self, brand: str, model: str):
        self.brand = brand
        self.model = model
        self.speed = 0

    # Method to accelerate
    def accelerate(self, increment: int):
        self.speed += increment

    # Method to display info
    def display_status(self):
        print(f"{self.brand} {self.model} is running at {self.speed} km/h.")`,
    cpp: `#include <iostream>
#include <string>

class Car {
private:
    std::string brand;
    std::string model;
    int speed;

public:
    Car(std::string b, std::string m) : brand(b), model(m), speed(0) {}

    void accelerate(int increment) {
        speed += increment;
    }

    void displayStatus() const {
        std::cout << brand << " " << model << " is running at " << speed << " km/h." << std::endl;
    }
};`,
    typescript: `export class Car {
    private brand: string;
    private model: string;
    private speed: number;

    constructor(brand: string, model: string) {
        this.brand = brand;
        this.model = model;
        this.speed = 0;
    }

    public accelerate(increment: number): void {
        this.speed += increment;
    }

    public displayStatus(): void {
        console.log(\`\${this.brand} \${this.model} is running at \${this.speed} km/h.\`);
    }
}`,
    go: `package main

import "fmt"

type Car struct {
    Brand string
    Model string
    Speed int
}

func NewCar(brand, model string) *Car {
    return &Car{Brand: brand, Model: model, Speed: 0}
}

func (c *Car) Accelerate(increment int) {
    c.Speed += increment
}

func (c *Car) DisplayStatus() {
    fmt.Printf("%s %s is running at %d km/h.\\n", c.Brand, c.Model, c.Speed)
}`,
  };

  const mainObjectSnippets: Record<SupportedLanguage, string> = {
    java: `public class Main {
    public static void main(String[] args) {
        // Creating objects of the Car class
        Car corolla = new Car("Toyota", "Corolla");
        Car mustang = new Car("Ford", "Mustang");

        corolla.accelerate(20);
        mustang.accelerate(40);

        // Displaying status of each car
        corolla.displayStatus();
        System.out.println("-----------------");
        mustang.displayStatus();
    }
}`,
    python: `if __name__ == "__main__":
    # Creating objects of the Car class
    corolla = Car("Toyota", "Corolla")
    mustang = Car("Ford", "Mustang")

    corolla.accelerate(20)
    mustang.accelerate(40)

    # Displaying status of each car
    corolla.display_status()
    print("-----------------")
    mustang.display_status()`,
    cpp: `int main() {
    // Creating objects of the Car class
    Car corolla("Toyota", "Corolla");
    Car mustang("Ford", "Mustang");

    corolla.accelerate(20);
    mustang.accelerate(40);

    // Displaying status of each car
    corolla.displayStatus();
    std::cout << "-----------------" << std::endl;
    mustang.displayStatus();
    return 0;
}`,
    typescript: `// Creating objects of the Car class
const corolla = new Car("Toyota", "Corolla");
const mustang = new Car("Ford", "Mustang");

corolla.accelerate(20);
mustang.accelerate(40);

// Displaying status of each car
corolla.displayStatus();
console.log("-----------------");
mustang.displayStatus();`,
    go: `func main() {
    corolla := NewCar("Toyota", "Corolla")
    mustang := NewCar("Ford", "Mustang")

    corolla.Accelerate(20)
    mustang.Accelerate(40)

    corolla.DisplayStatus()
    fmt.Println("-----------------")
    mustang.DisplayStatus()
}`,
  };

  const foodOrderSnippets: Record<SupportedLanguage, string> = {
    java: `import java.util.ArrayList;
import java.util.List;

class FoodOrder {
    private String orderId;
    private String customerName;
    private List<String> items;
    private double totalAmount;
    private boolean isPlaced;

    public FoodOrder(String orderId, String customerName) {
        this.orderId = orderId;
        this.customerName = customerName;
        this.items = new ArrayList<>();
        this.totalAmount = 0.0;
        this.isPlaced = false;
    }

    // Only allows adding items before the order is placed
    public void addItem(String name, double price) {
        if (isPlaced) {
            System.out.println("Cannot modify a placed order.");
            return;
        }
        items.add(name);
        totalAmount += price;
    }

    // Places the order if it has at least one item and hasn't been placed yet
    public boolean placeOrder() {
        if (isPlaced || items.isEmpty()) {
            return false;
        }
        this.isPlaced = true;
        return true;
    }
}`,
    python: `from typing import List

class FoodOrder:
    def __init__(self, order_id: str, customer_name: str):
        self.order_id = order_id
        self.customer_name = customer_name
        self.items: List[str] = []
        self.total_amount: float = 0.0
        self.is_placed: bool = False

    # Only allows adding items before the order is placed
    def add_item(self, name: str, price: float) -> None:
        if self.is_placed:
            print("Cannot modify a placed order.")
            return
        self.items.append(name)
        self.total_amount += price

    # Places the order if it has at least one item and hasn't been placed yet
    def place_order(self) -> bool:
        if self.is_placed or not self.items:
            return False
        self.is_placed = True
        return True`,
    cpp: `#include <iostream>
#include <string>
#include <vector>

class FoodOrder {
private:
    std::string orderId;
    std::string customerName;
    std::vector<std::string> items;
    double totalAmount;
    bool isPlaced;

public:
    FoodOrder(std::string id, std::string name)
        : orderId(id), customerName(name), totalAmount(0.0), isPlaced(false) {}

    void addItem(const std::string& name, double price) {
        if (isPlaced) {
            std::cout << "Cannot modify a placed order." << std::endl;
            return;
        }
        items.push_back(name);
        totalAmount += price;
    }

    bool placeOrder() {
        if (isPlaced || items.empty()) {
            return false;
        }
        isPlaced = true;
        return true;
    }
};`,
    typescript: `export class FoodOrder {
    private orderId: string;
    private customerName: string;
    private items: string[];
    private totalAmount: number;
    private isPlaced: boolean;

    constructor(orderId: string, customerName: string) {
        this.orderId = orderId;
        this.customerName = customerName;
        this.items = [];
        this.totalAmount = 0.0;
        this.isPlaced = false;
    }

    public addItem(name: string, price: number): void {
        if (this.isPlaced) {
            console.log("Cannot modify a placed order.");
            return;
        }
        this.items.push(name);
        this.totalAmount += price;
    }

    public placeOrder(): boolean {
        if (this.isPlaced || this.items.length === 0) {
            return false;
        }
        this.isPlaced = true;
        return true;
    }
}`,
    go: `package main

type FoodOrder struct {
    OrderID      string
    CustomerName string
    Items        []string
    TotalAmount  float64
    IsPlaced     bool
}

func NewFoodOrder(id, name string) *FoodOrder {
    return &FoodOrder{OrderID: id, CustomerName: name, Items: []string{}, TotalAmount: 0.0, IsPlaced: false}
}

func (o *FoodOrder) AddItem(name string, price float64) {
    if o.IsPlaced {
        return
    }
    o.Items = append(o.Items, name)
    o.TotalAmount += price
}

func (o *FoodOrder) PlaceOrder() bool {
    if o.IsPlaced || len(o.Items) == 0 {
        return false
    }
    o.IsPlaced = true
    return true
}`,
  };

  const sampleCarOutput = `Toyota Corolla is running at 20 km/h.
-----------------
Ford Mustang is running at 40 km/h.`;

  const paymentGatewaySnippets: Record<SupportedLanguage, string> = {
    java: `public interface PaymentGateway {
    void initiatePayment(double amount);
}

public class StripePayment implements PaymentGateway {
    public void initiatePayment(double amount) {
        System.out.println("Processing payment via Stripe: $" + amount);
    }
}

public class RazorpayPayment implements PaymentGateway {
    public void initiatePayment(double amount) {
        System.out.println("Processing payment via Razorpay: ₹" + amount);
    }
}

public class CheckoutService {
    private PaymentGateway paymentGateway;

    public CheckoutService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public void setPaymentGateway(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public void checkout(double amount) {
        paymentGateway.initiatePayment(amount);
    }
}

public class Main {
    public static void main(String[] args) {
        CheckoutService checkout = new CheckoutService(new StripePayment());
        checkout.checkout(100.0);

        checkout.setPaymentGateway(new RazorpayPayment());
        checkout.checkout(5000.0);
    }
}`,
    python: `from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @abstractmethod
    def initiate_payment(self, amount: float) -> None:
        pass

class StripePayment(PaymentGateway):
    def initiate_payment(self, amount: float) -> None:
        print(f"Processing payment via Stripe: \${amount}")

class RazorpayPayment(PaymentGateway):
    def initiate_payment(self, amount: float) -> None:
        print(f"Processing payment via Razorpay: ₹{amount}")

class CheckoutService:
    def __init__(self, payment_gateway: PaymentGateway):
        self.payment_gateway = payment_gateway

    def set_payment_gateway(self, payment_gateway: PaymentGateway) -> None:
        self.payment_gateway = payment_gateway

    def checkout(self, amount: float) -> None:
        self.payment_gateway.initiate_payment(amount)

if __name__ == "__main__":
    checkout = CheckoutService(StripePayment())
    checkout.checkout(100.0)

    checkout.set_payment_gateway(RazorpayPayment())
    checkout.checkout(5000.0)`,
    cpp: `#include <iostream>
#include <memory>

class PaymentGateway {
public:
    virtual ~PaymentGateway() = default;
    virtual void initiatePayment(double amount) = 0;
};

class StripePayment : public PaymentGateway {
public:
    void initiatePayment(double amount) override {
        std::cout << "Processing payment via Stripe: $" << amount << std::endl;
    }
};

class RazorpayPayment : public PaymentGateway {
public:
    void initiatePayment(double amount) override {
        std::cout << "Processing payment via Razorpay: ₹" << amount << std::endl;
    }
};

class CheckoutService {
private:
    std::shared_ptr<PaymentGateway> paymentGateway;
public:
    CheckoutService(std::shared_ptr<PaymentGateway> gateway) : paymentGateway(gateway) {}

    void setPaymentGateway(std::shared_ptr<PaymentGateway> gateway) {
        paymentGateway = gateway;
    }

    void checkout(double amount) {
        paymentGateway->initiatePayment(amount);
    }
};

int main() {
    auto checkout = std::make_unique<CheckoutService>(std::make_shared<StripePayment>());
    checkout->checkout(100.0);

    checkout->setPaymentGateway(std::make_shared<RazorpayPayment>());
    checkout->checkout(5000.0);
    return 0;
}`,
    typescript: `export interface PaymentGateway {
  initiatePayment(amount: number): void;
}

export class StripePayment implements PaymentGateway {
  initiatePayment(amount: number): void {
    console.log(\`Processing payment via Stripe: $\${amount}\`);
  }
}

export class RazorpayPayment implements PaymentGateway {
  initiatePayment(amount: number): void {
    console.log(\`Processing payment via Razorpay: ₹\${amount}\`);
  }
}

export class CheckoutService {
  constructor(private paymentGateway: PaymentGateway) {}

  public setPaymentGateway(paymentGateway: PaymentGateway): void {
    this.paymentGateway = paymentGateway;
  }

  public checkout(amount: number): void {
    this.paymentGateway.initiatePayment(amount);
  }
}

const checkout = new CheckoutService(new StripePayment());
checkout.checkout(100.0);

checkout.setPaymentGateway(new RazorpayPayment());
checkout.checkout(5000.0);`,
    go: `package main

import "fmt"

type PaymentGateway interface {
    InitiatePayment(amount float64)
}

type StripePayment struct{}

func (s *StripePayment) InitiatePayment(amount float64) {
    fmt.Printf("Processing payment via Stripe: $%.2f\\n", amount)
}

type RazorpayPayment struct{}

func (r *RazorpayPayment) InitiatePayment(amount float64) {
    fmt.Printf("Processing payment via Razorpay: ₹%.2f\\n", amount)
}

type CheckoutService struct {
    paymentGateway PaymentGateway
}

func NewCheckoutService(g PaymentGateway) *CheckoutService {
    return &CheckoutService{paymentGateway: g}
}

func (c *CheckoutService) SetPaymentGateway(g PaymentGateway) {
    c.paymentGateway = g
}

func (c *CheckoutService) Checkout(amount float64) {
    c.paymentGateway.InitiatePayment(amount)
}

func main() {
    checkout := NewCheckoutService(&StripePayment{})
    checkout.Checkout(100.0)

    checkout.SetPaymentGateway(&RazorpayPayment{})
    checkout.Checkout(5000.0)
}`,
  };

  const notificationSnippets: Record<SupportedLanguage, string> = {
    java: `interface NotificationService {
    void send(String recipient, String message);
}

class EmailNotifier implements NotificationService {
    public void send(String recipient, String message) {
        System.out.println("[Email] To: " + recipient + " | " + message);
    }
}

class SlackNotifier implements NotificationService {
    public void send(String recipient, String message) {
        System.out.println("[Slack] Channel: " + recipient + " | " + message);
    }
}

class WebhookNotifier implements NotificationService {
    public void send(String recipient, String message) {
        System.out.println("[Webhook] URL: " + recipient + " | " + message);
    }
}

class AlertService {
    private NotificationService notifier;

    public AlertService(NotificationService notifier) {
        this.notifier = notifier;
    }

    public void triggerAlert(String recipient, String issue) {
        String alertMessage = "ALERT: " + issue;
        notifier.send(recipient, alertMessage);
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        AlertService emailAlerts = new AlertService(new EmailNotifier());
        emailAlerts.triggerAlert("ops@company.com", "CPU usage at 95%");

        AlertService slackAlerts = new AlertService(new SlackNotifier());
        slackAlerts.triggerAlert("#incidents", "Database connection pool exhausted");

        AlertService webhookAlerts = new AlertService(new WebhookNotifier());
        webhookAlerts.triggerAlert("https://hooks.example.com/alerts", "Disk usage at 90%");
    }
}`,
    python: `from abc import ABC, abstractmethod

class NotificationService(ABC):
    @abstractmethod
    def send(self, recipient: str, message: str) -> None:
        pass

class EmailNotifier(NotificationService):
    def send(self, recipient: str, message: str) -> None:
        print(f"[Email] To: {recipient} | {message}")

class SlackNotifier(NotificationService):
    def send(self, recipient: str, message: str) -> None:
        print(f"[Slack] Channel: {recipient} | {message}")

class WebhookNotifier(NotificationService):
    def send(self, recipient: str, message: str) -> None:
        print(f"[Webhook] URL: {recipient} | {message}")

class AlertService:
    def __init__(self, notifier: NotificationService):
        self.notifier = notifier

    def trigger_alert(self, recipient: str, issue: str) -> None:
        alert_message = f"ALERT: {issue}"
        self.notifier.send(recipient, alert_message)

if __name__ == "__main__":
    email_alerts = AlertService(EmailNotifier())
    email_alerts.trigger_alert("ops@company.com", "CPU usage at 95%")

    slack_alerts = AlertService(SlackNotifier())
    slack_alerts.trigger_alert("#incidents", "Database connection pool exhausted")

    webhook_alerts = AlertService(WebhookNotifier())
    webhook_alerts.trigger_alert("https://hooks.example.com/alerts", "Disk usage at 90%")`,
    cpp: `#include <iostream>
#include <string>
#include <memory>

class NotificationService {
public:
    virtual ~NotificationService() = default;
    virtual void send(const std::string& recipient, const std::string& message) = 0;
};

class EmailNotifier : public NotificationService {
public:
    void send(const std::string& recipient, const std::string& message) override {
        std::cout << "[Email] To: " << recipient << " | " << message << std::endl;
    }
};

class SlackNotifier : public NotificationService {
public:
    void send(const std::string& recipient, const std::string& message) override {
        std::cout << "[Slack] Channel: " << recipient << " | " << message << std::endl;
    }
};

class WebhookNotifier : public NotificationService {
public:
    void send(const std::string& recipient, const std::string& message) override {
        std::cout << "[Webhook] URL: " << recipient << " | " << message << std::endl;
    }
};

class AlertService {
private:
    std::shared_ptr<NotificationService> notifier;
public:
    AlertService(std::shared_ptr<NotificationService> n) : notifier(n) {}

    void triggerAlert(const std::string& recipient, const std::string& issue) {
        std::string alertMessage = "ALERT: " + issue;
        notifier->send(recipient, alertMessage);
    }
};

int main() {
    AlertService emailAlerts(std::make_shared<EmailNotifier>());
    emailAlerts.triggerAlert("ops@company.com", "CPU usage at 95%");

    AlertService slackAlerts(std::make_shared<SlackNotifier>());
    slackAlerts.triggerAlert("#incidents", "Database connection pool exhausted");

    AlertService webhookAlerts(std::make_shared<WebhookNotifier>());
    webhookAlerts.triggerAlert("https://hooks.example.com/alerts", "Disk usage at 90%");
    return 0;
}`,
    typescript: `interface NotificationService {
  send(recipient: string, message: string): void;
}

class EmailNotifier implements NotificationService {
  send(recipient: string, message: string): void {
    console.log(\`[Email] To: \${recipient} | \${message}\`);
  }
}

class SlackNotifier implements NotificationService {
  send(recipient: string, message: string): void {
    console.log(\`[Slack] Channel: \${recipient} | \${message}\`);
  }
}

class WebhookNotifier implements NotificationService {
  send(recipient: string, message: string): void {
    console.log(\`[Webhook] URL: \${recipient} | \${message}\`);
  }
}

class AlertService {
  constructor(private notifier: NotificationService) {}

  triggerAlert(recipient: string, issue: string): void {
    const alertMessage = \`ALERT: \${issue}\`;
    this.notifier.send(recipient, alertMessage);
  }
}

// Usage
const emailAlerts = new AlertService(new EmailNotifier());
emailAlerts.triggerAlert("ops@company.com", "CPU usage at 95%");

const slackAlerts = new AlertService(new SlackNotifier());
slackAlerts.triggerAlert("#incidents", "Database connection pool exhausted");

const webhookAlerts = new AlertService(new WebhookNotifier());
webhookAlerts.triggerAlert("https://hooks.example.com/alerts", "Disk usage at 90%");`,
    go: `package main

import "fmt"

type NotificationService interface {
    Send(recipient, message string)
}

type EmailNotifier struct{}

func (e *EmailNotifier) Send(recipient, message string) {
    fmt.Printf("[Email] To: %s | %s\\n", recipient, message)
}

type SlackNotifier struct{}

func (s *SlackNotifier) Send(recipient, message string) {
    fmt.Printf("[Slack] Channel: %s | %s\\n", recipient, message)
}

type WebhookNotifier struct{}

func (w *WebhookNotifier) Send(recipient, message string) {
    fmt.Printf("[Webhook] URL: %s | %s\\n", recipient, message)
}

type AlertService struct {
    notifier NotificationService
}

func NewAlertService(n NotificationService) *AlertService {
    return &AlertService{notifier: n}
}

func (a *AlertService) TriggerAlert(recipient, issue string) {
    alertMessage := "ALERT: " + issue
    a.notifier.Send(recipient, alertMessage)
}

func main() {
    emailAlerts := NewAlertService(&EmailNotifier{})
    emailAlerts.TriggerAlert("ops@company.com", "CPU usage at 95%")

    slackAlerts := NewAlertService(&SlackNotifier{})
    slackAlerts.TriggerAlert("#incidents", "Database connection pool exhausted")

    webhookAlerts := NewAlertService(&WebhookNotifier{})
    webhookAlerts.TriggerAlert("https://hooks.example.com/alerts", "Disk usage at 90%")
}`,
  };

  return (
    <div className="reader-container">
      {/* Left syllabus column */}
      <aside className="reader-left-col">
        <button className="reader-back-btn" onClick={onBackToHome}>
          <ArrowLeft size={15} />
          <span>Back to Syllabus</span>
        </button>

        <div className="reader-course-header">
          <div className="reader-course-title">Low-Level Design Interviews</div>
          <div className="reader-progress-row">
            <span>{overallPercent}% complete</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {totalCompleted} / {totalChapters}
            </span>
          </div>
          <div className="reader-progress-track">
            <div
              className="reader-progress-fill"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        <div className="reader-search-input-box">
          <Search size={14} className="text-muted" />
          <input
            type="text"
            className="reader-search-input"
            placeholder="Search chapters..."
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {CURRICULUM_MODULES.map((mod) => {
            const isOpen = openModules[mod.id] ?? false;
            const modChapters = mod.chapterIds
              .map((id) => CURRICULUM_CHAPTERS[id])
              .filter(Boolean)
              .filter((ch) =>
                sidebarSearch.trim()
                  ? ch.title.toLowerCase().includes(sidebarSearch.toLowerCase())
                  : true
              );

            if (modChapters.length === 0 && sidebarSearch.trim()) return null;

            const modCompletedCount = mod.chapterIds.filter((id) =>
              completedChapterIds.includes(id)
            ).length;

            return (
              <div key={mod.id} className="reader-accordion-group">
                <div
                  className="reader-accordion-header"
                  onClick={() => toggleModuleAccordion(mod.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>{mod.title}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {modCompletedCount} / {mod.chapterIds.length}
                  </span>
                </div>

                {isOpen && (
                  <div className="reader-accordion-list">
                    {modChapters.map((ch) => {
                      const isActive = ch.id === chapter.id;
                      const isDone = completedChapterIds.includes(ch.id);

                      return (
                        <div
                          key={ch.id}
                          className={`reader-chapter-item ${isActive ? 'active' : ''}`}
                          onClick={() => onSelectChapter(ch.id)}
                        >
                          {isActive ? (
                            <div className="chapter-dot-icon chapter-dot-active">
                              <Play size={8} fill="currentColor" />
                            </div>
                          ) : isDone ? (
                            <div className="chapter-dot-icon chapter-dot-completed">
                              <CheckCircle2 size={16} fill="currentColor" color="#ffffff" />
                            </div>
                          ) : (
                            <div className="chapter-dot-icon chapter-dot-pending" />
                          )}

                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ch.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="reader-pro-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', fontWeight: 800, fontSize: '0.86rem' }}>
            <Crown size={16} />
            <span>Upgrade to Pro</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
            Get advanced problems, AI feedback and track your growth.
          </p>
          <button className="reader-pro-btn">
            <span>Upgrade Now</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </aside>

      {/* Main reading content pane */}
      <main className="reader-center-col">
        <div className="reader-breadcrumbs-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Learn</span>
            <span>&gt;</span>
            <span>{chapter.moduleTitle}</span>
            <span>&gt;</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{chapter.title}</span>
          </div>

          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
            }}
            title="Share Chapter"
          >
            <Share2 size={16} />
          </button>
        </div>        <div className="reader-main-title">
          <span>{chapter.title}</span>
          <span className="module-pill-badge">{chapter.moduleTitle || 'OOP'}</span>
        </div>

        <div className="reader-meta-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontWeight: 700 }}>
            <Flame size={15} fill="currentColor" />
            <span>{chapter.priority}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={15} />
            <span>{chapter.readTimeMinutes} min read</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={15} />
            <span>{chapter.lastUpdated || 'Updated July 2026'}</span>
          </div>
        </div>

        <p className="reader-lead-text">
          {chapter.summary}
        </p>

        {/* Key takeaway callout */}
        <div className="key-takeaway-card">
          <div className="key-takeaway-icon">
            <Lightbulb size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0284c7', marginBottom: '3px' }}>
              Key Takeaway
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {chapter.id === 'classes-and-objects'
                ? 'A class is a blueprint; an object is a real instance with its own state and behavior.'
                : chapter.sections?.[0]?.callout?.text || `Mastering ${chapter.title} establishes clean responsibility boundaries and high architectural modularity.`}
            </div>
          </div>
        </div>

        {chapter.id === 'classes-and-objects' ? (
          <>
            {/* Section 1: What is a Class? */}
            <div style={{ marginBottom: '22px' }} id="sec-1">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                1. What is a Class?
              </h2>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                A class is a blueprint, template, or recipe for creating objects. It defines what an object will contain (its data) and what it will be able to do (its behavior).
              </p>

              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                A class is not an object itself, it’s a template used to create many objects with similar structure but independent state.
              </p>

              {/* Modern Mental Model Comparison Card */}
              <div className="dl-mental-model-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', fontWeight: 800, fontSize: '0.92rem', marginBottom: '8px' }}>
                  <Lightbulb size={18} />
                  <span>Real-World Mental Model</span>
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Think of a class like a recipe for baking cakes:
                </p>

                <div className="dl-model-grid">
                  <div className="dl-model-box">
                    <div className="dl-model-box-header">
                      <span>📜 The Recipe (Class)</span>
                    </div>
                    <div className="dl-model-list">
                      <div>• <strong>Ingredients:</strong> Fields / variables (<code className="inline-code">flour</code>, <code className="inline-code">sugar</code>, <code className="inline-code">eggs</code>)</div>
                      <div>• <strong>Instructions:</strong> Methods / logic (<code className="inline-code">mix()</code>, <code className="inline-code">bake()</code>, <code className="inline-code">decorate()</code>)</div>
                      <div>• <strong>Role:</strong> Sits in the cookbook as a pure structural specification.</div>
                    </div>
                  </div>

                  <div className="dl-model-box">
                    <div className="dl-model-box-header">
                      <span>🎂 The Baked Cakes (Objects)</span>
                    </div>
                    <div className="dl-model-list">
                      <div>• <strong>Cake #1:</strong> Chocolate Fudge (Flavor: Dark Cocoa, Size: Large)</div>
                      <div>• <strong>Cake #2:</strong> Red Velvet (Flavor: Cream Vanilla, Size: Medium)</div>
                      <div>• <strong>Role:</strong> Tangible objects created from the same recipe with independent state.</div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-surface-subtle)', padding: '8px 12px', borderRadius: 'var(--r-md)' }}>
                  In code: the recipe is your class definition; each cake you bake is a concrete object living in memory.
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '18px 0 8px 0' }}>
                Key Characteristics of a Class:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0 16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.91rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '2px' }} fill="currentColor" color="#ffffff" />
                  <span>It groups related data (attributes) and actions (methods) together.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.91rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '2px' }} fill="currentColor" color="#ffffff" />
                  <span>Defines attributes to represent the state or data of an object.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.91rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '2px' }} fill="currentColor" color="#ffffff" />
                  <span>Defines methods (functions inside a class) to represent the behavior or actions the object can perform.</span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '14px 0 6px 0' }}>
                Example: Class Blueprint
              </h3>
              <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Let’s define a simple <code className="inline-code">Car</code> class with essential attributes and methods that any Car object will have.
              </p>
              <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: '4px' }}>
                The following diagram and code show the blueprint for a Car:
              </p>

              {/* DesignLoop Signature Class Blueprint Canvas */}
              <div className="dl-canvas-container">
                <div className="dl-canvas-badge-bar">
                  <div className="dl-canvas-pill">
                    <span>Architecture Blueprint</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    DesignLoop Visual Model
                  </span>
                </div>

                <div className="dl-blueprint-node">
                  <div className="dl-blueprint-header">
                    <span className="dl-blueprint-title">Car</span>
                    <span className="dl-blueprint-tag">class</span>
                  </div>

                  <div className="dl-blueprint-section">
                    <div className="dl-member-row">
                      <span className="dl-vis-minus">-</span>
                      <span>brand: <span className="dl-type-pill">String</span></span>
                    </div>
                    <div className="dl-member-row">
                      <span className="dl-vis-minus">-</span>
                      <span>model: <span className="dl-type-pill">String</span></span>
                    </div>
                    <div className="dl-member-row">
                      <span className="dl-vis-minus">-</span>
                      <span>speed: <span className="dl-type-pill">int</span></span>
                    </div>

                    <div className="dl-blueprint-divider" />

                    <div className="dl-member-row">
                      <span className="dl-vis-plus">+</span>
                      <span>Car(brand: <span className="dl-type-pill">String</span>, model: <span className="dl-type-pill">String</span>)</span>
                    </div>
                    <div className="dl-member-row">
                      <span className="dl-vis-plus">+</span>
                      <span>accelerate(increment: <span className="dl-type-pill">int</span>): <span style={{ color: 'var(--text-muted)' }}>void</span></span>
                    </div>
                    <div className="dl-member-row">
                      <span className="dl-vis-plus">+</span>
                      <span>displayStatus(): <span style={{ color: 'var(--text-muted)' }}>void</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Car Class Code */}
              <div style={{ margin: '10px 0' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Code:
                </div>
                <CodeStudio
                  snippets={carClassSnippets}
                  initialLanguage={selectedLanguage}
                  onLanguageChange={onSelectLanguage}
                />
              </div>

              <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                This <code className="inline-code inline-tag-green">Car</code> class defines what every car object should look like (brand, model, speed) and what it can do (accelerate, display status). But a class on its own is just a definition sitting in your source code. To actually do anything useful, you need to create objects from it.
              </p>
            </div>

            {/* Section 2: What is an Object? */}
            <div style={{ marginBottom: '22px' }} id="sec-2">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                2. What is an Object?
              </h2>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                An object is an instance of a class. It's the actual thing you can interact with, store data in, and invoke methods on.
              </p>

              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                When you create an object, you’re essentially saying:
              </p>

              <div
                style={{
                  padding: '14px 18px',
                  borderLeft: '4px solid #6366f1',
                  background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.12), transparent)',
                  borderRadius: '0 10px 10px 0',
                  margin: '12px 0',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                “Take this blueprint (class) and build one actual thing (object) out of it.”
              </div>

              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Each object gets its own copy of the data defined in the class, shares the same structure and behavior, and operates independently of every other object created from that same class.
              </p>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0 6px 0' }}>
                Creating Objects
              </h3>
              <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Let’s now create a few car objects using our <code className="inline-code inline-tag-green">Car</code> class.
              </p>

              {/* DesignLoop Signature Object Instances Stage */}
              <div className="dl-canvas-container">
                <div className="dl-canvas-badge-bar">
                  <div className="dl-canvas-pill">
                    <span>Runtime Memory Allocation</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Heap Visualization
                  </span>
                </div>

                <div className="dl-instances-stage">
                  {/* Tier 1 Label */}
                  <div className="dl-tier-label">
                    <span>Metaspace / Code Segment (Class Blueprint)</span>
                  </div>

                  {/* Top Blueprint */}
                  <div className="dl-blueprint-node dl-connected-blueprint" style={{ maxWidth: '340px' }}>
                    <div className="dl-blueprint-header">
                      <span className="dl-blueprint-title">Car</span>
                      <span className="dl-blueprint-tag">class blueprint</span>
                    </div>
                    <div className="dl-blueprint-section" style={{ fontSize: '0.78rem' }}>
                      <div className="dl-member-row">
                        <span className="dl-vis-minus">-</span>
                        <span>brand: <span className="dl-type-pill">String</span>, model: <span className="dl-type-pill">String</span>, speed: <span className="dl-type-pill">int</span></span>
                      </div>
                      <div className="dl-blueprint-divider" />
                      <div className="dl-member-row">
                        <span className="dl-vis-plus">+</span>
                        <span>Car(brand, model), accelerate(inc), displayStatus()</span>
                      </div>
                    </div>
                    <div className="dl-pin dl-pin-bottom" />
                  </div>

                  {/* Connected SVG Bus System */}
                  <div className="dl-svg-bus-container">
                    <svg className="dl-bus-svg" viewBox="0 0 580 80" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="busGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                        <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>

                      {/* Central Stem */}
                      <line x1="290" y1="0" x2="290" y2="40" stroke="url(#pulseGrad)" strokeWidth="2.5" strokeDasharray="4 3" className="dl-animated-bus" />

                      {/* Left Curve to Corolla */}
                      <path d="M 290 40 C 290 68, 145 45, 145 80" fill="none" stroke="url(#busGrad)" strokeWidth="2.5" />

                      {/* Right Curve to Mustang */}
                      <path d="M 290 40 C 290 68, 435 45, 435 80" fill="none" stroke="url(#busGrad)" strokeWidth="2.5" />

                      {/* Junction Nodes */}
                      <circle cx="290" cy="40" r="5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="145" cy="78" r="4" fill="#6366f1" />
                      <circle cx="435" cy="78" r="4" fill="#38bdf8" />
                    </svg>

                    {/* Central Floating Instantiation Hub */}
                    <div className="dl-instantiation-hub">
                      <Zap size={13} className="dl-hub-icon" />
                      <span>new Car(...) Instantiation & Memory Allocation</span>
                    </div>
                  </div>

                  {/* Tier 2 Label */}
                  <div className="dl-tier-label" style={{ marginTop: '2px' }}>
                    <span>Heap Memory (Independent Instance Records)</span>
                  </div>

                  {/* Instances Row */}
                  <div className="dl-instances-row">
                    {/* Corolla Instance */}
                    <div className={`dl-instance-node ${lastMutated === 'corolla' ? 'dl-mutated-pulse' : ''}`}>
                      <div className="dl-pin dl-pin-top" />
                      <div className="dl-instance-top">
                        <div className="dl-instance-name">
                          <span className="dl-name-var">corolla</span>
                          <span className="dl-name-type">: Car</span>
                        </div>
                        <span className="dl-addr-pill">@0x4A8F</span>
                      </div>

                      <div className="dl-instance-state">
                        <div className="dl-state-row">
                          <span className="dl-state-key">brand:</span>
                          <span className="dl-val-str">"Toyota"</span>
                        </div>
                        <div className="dl-state-row">
                          <span className="dl-state-key">model:</span>
                          <span className="dl-val-str">"Corolla"</span>
                        </div>
                        <div className="dl-state-row">
                          <span className="dl-state-key">speed:</span>
                          <span className="dl-val-num">{corollaSpeed} km/h</span>
                        </div>
                        <div className="dl-gauge-track">
                          <div className="dl-gauge-fill" style={{ width: `${Math.min(100, (corollaSpeed / 120) * 100)}%` }} />
                        </div>
                      </div>

                      <div className="dl-instance-actions">
                        <button
                          className="dl-micro-btn dl-micro-accel"
                          onClick={() => {
                            setCorollaSpeed((prev) => prev + 10);
                            setLastMutated('corolla');
                            setHeapLog(`corolla.accelerate(10) called: Address @0x4A8F speed -> ${corollaSpeed + 10} km/h. Mustang at @0x9B2C remains untouched (${mustangSpeed} km/h).`);
                          }}
                        >
                          + Accelerate (+10)
                        </button>
                        <button
                          className="dl-micro-btn dl-micro-brake"
                          disabled={corollaSpeed <= 0}
                          onClick={() => {
                            setCorollaSpeed((prev) => Math.max(0, prev - 10));
                            setLastMutated('corolla');
                            setHeapLog(`corolla braked: Address @0x4A8F speed -> ${Math.max(0, corollaSpeed - 10)} km/h.`);
                          }}
                        >
                          Brake (-10)
                        </button>
                      </div>
                    </div>

                    {/* Mustang Instance */}
                    <div className={`dl-instance-node ${lastMutated === 'mustang' ? 'dl-mutated-pulse' : ''}`}>
                      <div className="dl-pin dl-pin-top" />
                      <div className="dl-instance-top">
                        <div className="dl-instance-name">
                          <span className="dl-name-var">mustang</span>
                          <span className="dl-name-type">: Car</span>
                        </div>
                        <span className="dl-addr-pill">@0x9B2C</span>
                      </div>

                      <div className="dl-instance-state">
                        <div className="dl-state-row">
                          <span className="dl-state-key">brand:</span>
                          <span className="dl-val-str">"Ford"</span>
                        </div>
                        <div className="dl-state-row">
                          <span className="dl-state-key">model:</span>
                          <span className="dl-val-str">"Mustang"</span>
                        </div>
                        <div className="dl-state-row">
                          <span className="dl-state-key">speed:</span>
                          <span className="dl-val-num">{mustangSpeed} km/h</span>
                        </div>
                        <div className="dl-gauge-track">
                          <div className="dl-gauge-fill" style={{ width: `${Math.min(100, (mustangSpeed / 120) * 100)}%` }} />
                        </div>
                      </div>

                      <div className="dl-instance-actions">
                        <button
                          className="dl-micro-btn dl-micro-accel"
                          onClick={() => {
                            setMustangSpeed((prev) => prev + 10);
                            setLastMutated('mustang');
                            setHeapLog(`mustang.accelerate(10) called: Address @0x9B2C speed -> ${mustangSpeed + 10} km/h. Corolla at @0x4A8F remains untouched (${corollaSpeed} km/h).`);
                          }}
                        >
                          + Accelerate (+10)
                        </button>
                        <button
                          className="dl-micro-btn dl-micro-brake"
                          disabled={mustangSpeed <= 0}
                          onClick={() => {
                            setMustangSpeed((prev) => Math.max(0, prev - 10));
                            setLastMutated('mustang');
                            setHeapLog(`mustang braked: Address @0x9B2C speed -> ${Math.max(0, mustangSpeed - 10)} km/h.`);
                          }}
                        >
                          Brake (-10)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="dl-stage-footer">
                    <CheckCircle2 size={16} className="dl-footer-check" />
                    <span>{heapLog}</span>
                  </div>
                </div>
              </div>

              <div style={{ margin: '10px 0' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Code
                </div>
                <CodeStudio
                  snippets={mainObjectSnippets}
                  sampleOutput={sampleCarOutput}
                  initialLanguage={selectedLanguage}
                  onLanguageChange={onSelectLanguage}
                  showRun={true}
                />
              </div>

              <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '10px' }}>
                Notice how <code className="inline-code inline-tag-green">corolla</code> and <code className="inline-code inline-tag-green">mustang</code> are both <code className="inline-code inline-tag-green">Car</code> objects, but they maintain completely independent state. When we called <code className="inline-code inline-tag-green">corolla.accelerate(20)</code>, only the Corolla's speed changed. The Mustang stayed at 0 until we explicitly accelerated it to 40.
              </p>
            </div>

            {/* Section 3: Practical Example: Online Food Order */}
            <div style={{ marginBottom: '22px' }} id="sec-3">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                3. Practical Example: Online Food Order
              </h2>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Let's apply classes and objects to a real-world problem: building an order management system for a food delivery platform.
              </p>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '14px 0 6px 0' }}>
                The Scenario
              </h3>
              <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                A food delivery app needs to manage orders.
              </p>
              <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '6px' }}>
                Each order belongs to a customer, contains a list of food items with prices, and tracks whether it has been placed. Customers build their order by adding items one at a time, and once they're satisfied, they place the order. After that, no more items can be added.
              </p>
              <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '6px' }}>
                Without classes, you'd have separate arrays for order IDs, customer names, item lists, and totals with no clean way to enforce rules like "don't add items after placing."
              </p>
              <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '6px' }}>
                With classes, the <code className="inline-code inline-tag-green">Order</code> owns its data and enforces invariants: <code className="inline-code">addItem()</code> works only before <code className="inline-code inline-tag-green">place()</code>, so invalid states are prevented by design.
              </p>

              <div style={{ margin: '12px 0' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Code
                </div>
                <CodeStudio
                  snippets={foodOrderSnippets}
                  initialLanguage={selectedLanguage}
                  onLanguageChange={onSelectLanguage}
                  showRun={true}
                />
              </div>

              {/* DesignLoop Signature Why This Design Works Grid */}
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '20px 0 10px 0' }} id="sec-4">
                Why This Design Works
              </h2>
              <div className="dl-why-grid">
                <div className="dl-why-card">
                  <div className="dl-why-header">
                    <div className="dl-why-icon-wrap">
                      <CheckCircle2 size={16} />
                    </div>
                    <span>State Encapsulation</span>
                  </div>
                  <div className="dl-why-text">
                    Items, total amount, and placement status live together within the object instead of disparate variables across multiple arrays.
                  </div>
                </div>

                <div className="dl-why-card">
                  <div className="dl-why-header">
                    <div className="dl-why-icon-wrap">
                      <CheckCircle2 size={16} />
                    </div>
                    <span>Invariant Protection</span>
                  </div>
                  <div className="dl-why-text">
                    The <code className="inline-code">addItem()</code> method actively validates order status, making it impossible to inject items into already placed orders.
                  </div>
                </div>

                <div className="dl-why-card">
                  <div className="dl-why-header">
                    <div className="dl-why-icon-wrap">
                      <CheckCircle2 size={16} />
                    </div>
                    <span>Massive Reusability</span>
                  </div>
                  <div className="dl-why-text">
                    A single <code className="inline-code">FoodOrder</code> class can instantiate thousands of independent customer orders with guaranteed structural consistency.
                  </div>
                </div>

                <div className="dl-why-card">
                  <div className="dl-why-header">
                    <div className="dl-why-icon-wrap">
                      <CheckCircle2 size={16} />
                    </div>
                    <span>Seamless Extensibility</span>
                  </div>
                  <div className="dl-why-text">
                    Adding discount engines, tracking coordinates, or payment methods in the future requires modifying only this class without breaking existing call sites.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : chapter.id === 'interfaces' ? (
          <>
            {/* Section 1: What is an Interface? */}
            <div style={{ marginBottom: '28px' }} id="sec-1">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                1. What is an Interface?
              </h2>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                In object-oriented design, interfaces serve as the foundational architectural mechanism for constructing systems that are modular, decoupled, and straightforward to test.
              </p>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: '8px' }}>
                Fundamentally, an <strong>interface is an explicit contract</strong>: a specification of methods that any implementing class promises to provide. It defines the public boundary and expected operations, while delegating the underlying implementation details entirely to each concrete class.
              </p>

              {/* DesignLoop Mental Model Callout Card */}
              <div className="dl-mental-model-card" style={{ margin: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', fontWeight: 800, fontSize: '0.92rem', marginBottom: '8px' }}>
                  <Lightbulb size={18} />
                  <span>The Architectural Contract Separation</span>
                </div>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--bg-surface-subtle)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1.5,
                  }}
                >
                  &ldquo;An interface defines the <span style={{ color: 'var(--brand-primary)' }}>WHAT</span> (behavioral contract), while classes provide the <span style={{ color: '#10b981' }}>HOW</span> (concrete execution).&rdquo;
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.55 }}>
                  This clean separation isolates callers from the inner workings of providers, allowing components to interact through predictable contracts without tight coupling.
                </p>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '18px 0 6px 0' }}>
                Real-World Mental Model: Universal Remote Control
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Consider a universal remote control. It provides a standardized set of buttons:
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0 14px 0' }}>
                <span className="inline-code inline-tag-green">play()</span>
                <span className="inline-code inline-tag-green">pause()</span>
                <span className="inline-code inline-tag-green">volumeUp()</span>
                <span className="inline-code inline-tag-green">powerOff()</span>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                As the user, you press the same <code className="inline-code">play()</code> button whether the remote is pointed at a Smart TV, an Audio Soundbar, or an Overhead Projector. The contract is consistent, while each device executes its own internal hardware routine.
              </p>

              {/* DesignLoop Signature Architecture Blueprint 1: Universal Remote Contract */}
              <div className="dl-canvas-container" style={{ margin: '18px 0' }}>
                <div className="dl-canvas-badge-bar">
                  <div className="dl-canvas-pill">
                    <Sparkles size={13} />
                    <span>Architecture Blueprint</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    DesignLoop Realization Model
                  </span>
                </div>

                <div className="dl-instances-stage">
                  <div className="dl-tier-label">
                    <span>Contract Definition Layer</span>
                  </div>

                  {/* Top Blueprint Node: Interface */}
                  <div className="dl-blueprint-node dl-connected-blueprint" style={{ maxWidth: '340px' }}>
                    <div className="dl-blueprint-header" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      <span className="dl-blueprint-title">RemoteControl</span>
                      <span className="dl-blueprint-tag">&lt;&lt;interface&gt;&gt;</span>
                    </div>
                    <div className="dl-blueprint-section">
                      <div className="dl-member-row">
                        <span className="dl-vis-plus">+</span>
                        <span>play(): <span className="dl-type-pill">void</span></span>
                      </div>
                      <div className="dl-member-row">
                        <span className="dl-vis-plus">+</span>
                        <span>pause(): <span className="dl-type-pill">void</span></span>
                      </div>
                      <div className="dl-member-row">
                        <span className="dl-vis-plus">+</span>
                        <span>volumeUp(): <span className="dl-type-pill">void</span></span>
                      </div>
                      <div className="dl-member-row">
                        <span className="dl-vis-plus">+</span>
                        <span>powerOff(): <span className="dl-type-pill">void</span></span>
                      </div>
                    </div>
                    <div className="dl-pin dl-pin-bottom" style={{ background: '#8b5cf6' }} />
                  </div>

                  {/* Connected SVG Bus System */}
                  <div className="dl-svg-bus-container" style={{ height: '70px' }}>
                    <svg className="dl-bus-svg" viewBox="0 0 600 70" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="remoteBusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>

                      {/* Central Stem */}
                      <line x1="300" y1="0" x2="300" y2="35" stroke="url(#remoteBusGrad)" strokeWidth="2.5" strokeDasharray="4 3" className="dl-animated-bus" />

                      {/* Branches to TV, Soundbar, Projector */}
                      <path d="M 300 35 C 300 55, 100 45, 100 70" fill="none" stroke="url(#remoteBusGrad)" strokeWidth="2" strokeDasharray="5,4" />
                      <path d="M 300 35 C 300 55, 300 50, 300 70" fill="none" stroke="url(#remoteBusGrad)" strokeWidth="2" strokeDasharray="5,4" />
                      <path d="M 300 35 C 300 55, 500 45, 500 70" fill="none" stroke="url(#remoteBusGrad)" strokeWidth="2" strokeDasharray="5,4" />

                      {/* Junction Nodes */}
                      <circle cx="300" cy="35" r="5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="100" cy="68" r="4" fill="#6366f1" />
                      <circle cx="300" cy="68" r="4" fill="#8b5cf6" />
                      <circle cx="500" cy="68" r="4" fill="#10b981" />
                    </svg>
                  </div>

                  <div className="dl-tier-label" style={{ marginBottom: '14px' }}>
                    <span>Polymorphic Realization Implementations</span>
                  </div>

                  {/* 3 Realization Class Nodes */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', width: '100%', maxWidth: '600px' }}>
                    {/* TV */}
                    <div className="dl-blueprint-node" style={{ borderColor: activeRemoteDevice === 'tv' ? 'var(--brand-primary)' : 'var(--border-subtle)', boxShadow: activeRemoteDevice === 'tv' ? '0 0 16px var(--brand-primary-subtle)' : 'none' }}>
                      <div className="dl-blueprint-header" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                        <span className="dl-blueprint-title" style={{ fontSize: '0.92rem' }}>SmartTV</span>
                        <span className="dl-blueprint-tag">implements</span>
                      </div>
                      <div className="dl-blueprint-section" style={{ fontSize: '0.78rem' }}>
                        <div><span className="dl-vis-plus">+</span> play() <span style={{ color: 'var(--text-muted)' }}>// 4K OLED display</span></div>
                        <div><span className="dl-vis-plus">+</span> pause()</div>
                        <div><span className="dl-vis-plus">+</span> volumeUp()</div>
                        <div><span className="dl-vis-plus">+</span> powerOff()</div>
                      </div>
                    </div>

                    {/* SoundBar */}
                    <div className="dl-blueprint-node" style={{ borderColor: activeRemoteDevice === 'soundbar' ? 'var(--brand-primary)' : 'var(--border-subtle)', boxShadow: activeRemoteDevice === 'soundbar' ? '0 0 16px var(--brand-primary-subtle)' : 'none' }}>
                      <div className="dl-blueprint-header" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                        <span className="dl-blueprint-title" style={{ fontSize: '0.92rem' }}>SoundBar</span>
                        <span className="dl-blueprint-tag">implements</span>
                      </div>
                      <div className="dl-blueprint-section" style={{ fontSize: '0.78rem' }}>
                        <div><span className="dl-vis-plus">+</span> play() <span style={{ color: 'var(--text-muted)' }}>// Dolby Atmos DSP</span></div>
                        <div><span className="dl-vis-plus">+</span> pause()</div>
                        <div><span className="dl-vis-plus">+</span> volumeUp()</div>
                        <div><span className="dl-vis-plus">+</span> powerOff()</div>
                      </div>
                    </div>

                    {/* Projector */}
                    <div className="dl-blueprint-node" style={{ borderColor: activeRemoteDevice === 'projector' ? 'var(--brand-primary)' : 'var(--border-subtle)', boxShadow: activeRemoteDevice === 'projector' ? '0 0 16px var(--brand-primary-subtle)' : 'none' }}>
                      <div className="dl-blueprint-header" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                        <span className="dl-blueprint-title" style={{ fontSize: '0.92rem' }}>Projector</span>
                        <span className="dl-blueprint-tag">implements</span>
                      </div>
                      <div className="dl-blueprint-section" style={{ fontSize: '0.78rem' }}>
                        <div><span className="dl-vis-plus">+</span> play() <span style={{ color: 'var(--text-muted)' }}>// Laser lamp engine</span></div>
                        <div><span className="dl-vis-plus">+</span> pause()</div>
                        <div><span className="dl-vis-plus">+</span> volumeUp()</div>
                        <div><span className="dl-vis-plus">+</span> powerOff()</div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Remote Controller Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '600px',
                      marginTop: '20px',
                      padding: '16px 18px',
                      borderRadius: 'var(--r-lg)',
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        🎮 Target Injected Device:
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['tv', 'soundbar', 'projector'] as const).map((dev) => (
                          <button
                            key={dev}
                            onClick={() => {
                              setActiveRemoteDevice(dev);
                              setRemoteOutput(`${dev.toUpperCase()}: Swapped device target. Ready for commands.`);
                            }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 'var(--r-md)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: activeRemoteDevice === dev ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                              background: activeRemoteDevice === dev ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                              color: activeRemoteDevice === dev ? 'var(--brand-primary)' : 'var(--text-secondary)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {dev === 'tv' ? 'Sony TV' : dev === 'soundbar' ? 'Bose SoundBar' : 'Epson Projector'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="dl-dock-action-pill"
                        onClick={() => setRemoteOutput(`${activeRemoteDevice.toUpperCase()}: Executing play() → Initiating device playback stream.`)}
                      >
                        ▶ play()
                      </button>
                      <button
                        className="dl-dock-action-pill"
                        onClick={() => setRemoteOutput(`${activeRemoteDevice.toUpperCase()}: Executing pause() → Pausing stream buffers.`)}
                      >
                        ⏸ pause()
                      </button>
                      <button
                        className="dl-dock-action-pill"
                        onClick={() => setRemoteOutput(`${activeRemoteDevice.toUpperCase()}: Executing volumeUp() → Gain incremented +5dB.`)}
                      >
                        🔊 volumeUp()
                      </button>
                      <button
                        className="dl-dock-action-pill"
                        onClick={() => setRemoteOutput(`${activeRemoteDevice.toUpperCase()}: Executing powerOff() → Standby state engaged.`)}
                      >
                        ⏻ powerOff()
                      </button>
                    </div>

                    <div style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#10b981' }}>
                      &gt; {remoteOutput}
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                The <strong>remote</strong> is the <strong>interface</strong>. The <strong>devices</strong> (TV, soundbar, projector) are the <strong>concrete implementations</strong>.
              </p>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>
                Each device implements custom hardware logic when you invoke <code className="inline-code inline-tag-green">play()</code>, but callers only interact with the unified interface contract.
              </p>
            </div>

            {/* Section 2: Key Properties of Interfaces */}
            <div style={{ marginBottom: '28px' }} id="sec-2">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                2. Key Architectural Superpowers of Interfaces
              </h2>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Interfaces are more than mere method signatures—they form the structural backbone of resilient, maintainable software architectures:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '16px 0' }}>
                <div className="dl-why-card">
                  <div className="dl-why-header">
                    <div className="dl-why-icon-wrap">
                      <Sparkles size={16} />
                    </div>
                    <span>Behavior Without Implementation</span>
                  </div>
                  <div className="dl-why-text">
                    An interface declares what operations exist without imposing how they run, granting implementers full freedom to customize internal logic.
                  </div>
                </div>

                <div className="dl-why-card">
                  <div className="dl-why-header">
                    <div className="dl-why-icon-wrap">
                      <Zap size={16} />
                    </div>
                    <span>Runtime Polymorphism</span>
                  </div>
                  <div className="dl-why-text">
                    Multiple classes satisfy the same contract uniquely. Callers swap implementations dynamically at runtime without altering core business rules.
                  </div>
                </div>

                <div className="dl-why-card">
                  <div className="dl-why-header">
                    <div className="dl-why-icon-wrap">
                      <CheckCircle2 size={16} />
                    </div>
                    <span>Decoupling & Testability</span>
                  </div>
                  <div className="dl-why-text">
                    Services depending on interface abstractions are insulated from third-party vendor churn and allow seamless mocking during unit tests.
                  </div>
                </div>
              </div>

              {/* DesignLoop Signature Dependency Inversion Architecture Canvas */}
              <div className="dl-canvas-container" style={{ margin: '18px 0' }}>
                <div className="dl-canvas-badge-bar">
                  <div className="dl-canvas-pill">
                    <Zap size={13} />
                    <span>Dependency Inversion Architecture</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Decoupled System Topology
                  </span>
                </div>

                <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', width: '100%', flexWrap: 'wrap' }}>
                    {/* High Level Consumer */}
                    <div className="dl-blueprint-node" style={{ maxWidth: '280px', width: '100%' }}>
                      <div className="dl-blueprint-header" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
                        <span className="dl-blueprint-title" style={{ fontSize: '0.9rem' }}>CheckoutService</span>
                        <span className="dl-blueprint-tag">high-level domain</span>
                      </div>
                      <div className="dl-blueprint-section" style={{ fontSize: '0.78rem' }}>
                        <div><span className="dl-vis-minus">-</span> gateway: <span className="dl-type-pill">PaymentGateway</span></div>
                        <div><span className="dl-vis-plus">+</span> checkout(amount: double)</div>
                      </div>
                    </div>

                    <div style={{ color: 'var(--brand-primary)', fontWeight: 800, fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                      &mdash;depends on&rarr;
                    </div>

                    {/* Interface Abstraction */}
                    <div className="dl-blueprint-node" style={{ maxWidth: '280px', width: '100%' }}>
                      <div className="dl-blueprint-header" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <span className="dl-blueprint-title" style={{ fontSize: '0.9rem' }}>PaymentGateway</span>
                        <span className="dl-blueprint-tag">&lt;&lt;interface&gt;&gt;</span>
                      </div>
                      <div className="dl-blueprint-section" style={{ fontSize: '0.78rem' }}>
                        <div><span className="dl-vis-plus">+</span> initiatePayment(amount)</div>
                      </div>
                    </div>
                  </div>

                  {/* Concrete Implementations Row */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                      ▲ Concrete Providers (Plugged via Interface)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', width: '100%' }}>
                      <div className="dl-blueprint-node">
                        <div className="dl-blueprint-header" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                          <span className="dl-blueprint-title" style={{ fontSize: '0.86rem' }}>StripePayment</span>
                          <span className="dl-blueprint-tag">implements</span>
                        </div>
                        <div className="dl-blueprint-section" style={{ fontSize: '0.75rem' }}>
                          <div><span className="dl-vis-plus">+</span> initiatePayment()</div>
                        </div>
                      </div>

                      <div className="dl-blueprint-node">
                        <div className="dl-blueprint-header" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                          <span className="dl-blueprint-title" style={{ fontSize: '0.86rem' }}>RazorpayPayment</span>
                          <span className="dl-blueprint-tag">implements</span>
                        </div>
                        <div className="dl-blueprint-section" style={{ fontSize: '0.75rem' }}>
                          <div><span className="dl-vis-plus">+</span> initiatePayment()</div>
                        </div>
                      </div>

                      <div className="dl-blueprint-node">
                        <div className="dl-blueprint-header" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                          <span className="dl-blueprint-title" style={{ fontSize: '0.86rem' }}>PayPalPayment</span>
                          <span className="dl-blueprint-tag">implements</span>
                        </div>
                        <div className="dl-blueprint-section" style={{ fontSize: '0.75rem' }}>
                          <div><span className="dl-vis-plus">+</span> initiatePayment()</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                As long as all payment providers implement the <code className="inline-code inline-tag-green">PaymentGateway</code> interface, the <code className="inline-code inline-tag-green">CheckoutService</code> can interact with any provider without modifying a single line of business logic.
              </p>
            </div>

            {/* Section 3: Code Example: Payment Gateway Interface */}
            <div style={{ marginBottom: '28px' }} id="sec-3">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                3. Code Example: Dynamic Multi-Provider Payment Processing
              </h2>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Let’s examine how to design a production-grade payment processing architecture that seamlessly supports multiple gateways.
              </p>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: '4px' }}>
                By injecting the <code className="inline-code">PaymentGateway</code> contract into <code className="inline-code">CheckoutService</code>, our checkout engine becomes 100% provider-agnostic.
              </p>

              {/* Interactive Payment Gateway Simulator */}
              <div
                style={{
                  margin: '18px 0',
                  padding: '18px',
                  borderRadius: 'var(--r-lg)',
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crown size={17} style={{ color: 'var(--brand-primary)' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Interactive Checkout Engine Playground
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['stripe', 'razorpay'] as const).map((gw) => (
                      <button
                        key={gw}
                        onClick={() => {
                          setActiveGateway(gw);
                          setPaymentOutput(
                            gw === 'stripe'
                              ? `Processing payment via Stripe: $${paymentAmount.toFixed(1)}`
                              : `Processing payment via Razorpay: ₹${(paymentAmount * 85).toFixed(1)}`
                          );
                        }}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--r-md)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: activeGateway === gw ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          background: activeGateway === gw ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                          color: activeGateway === gw ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {gw === 'stripe' ? 'Stripe Gateway' : 'Razorpay Gateway'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Amount ($):</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value));
                        setPaymentAmount(val);
                        setPaymentOutput(
                          activeGateway === 'stripe'
                            ? `Processing payment via Stripe: $${val.toFixed(1)}`
                            : `Processing payment via Razorpay: ₹${(val * 85).toFixed(1)}`
                        );
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem',
                        width: '90px',
                      }}
                    />
                  </div>

                  <button
                    className="dl-dock-action-pill"
                    onClick={() => {
                      setPaymentOutput(
                        activeGateway === 'stripe'
                          ? `[CheckoutService] Injected: StripePayment -> Executed initiatePayment(${paymentAmount}) -> SUCCESS: $${paymentAmount.toFixed(1)} billed to customer card.`
                          : `[CheckoutService] Injected: RazorpayPayment -> Executed initiatePayment(${paymentAmount * 85}) -> SUCCESS: ₹${(paymentAmount * 85).toFixed(1)} routed via UPI.`
                      );
                    }}
                  >
                    🚀 Trigger Checkout
                  </button>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#10b981' }}>
                  &gt; {paymentOutput}
                </div>
              </div>

              {/* Payment Gateway CodeStudio */}
              <div style={{ margin: '14px 0' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Code: Full Multi-Language Implementation
                </div>
                <CodeStudio
                  snippets={paymentGatewaySnippets}
                  initialLanguage={selectedLanguage}
                  onLanguageChange={onSelectLanguage}
                  showRun={true}
                />
              </div>

              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                Notice the <code className="inline-code inline-tag-green">CheckoutService</code> constructor. It accepts a <code className="inline-code inline-tag-green">PaymentGateway</code> interface reference rather than a concrete class. This fundamental pattern is <strong>Dependency Injection</strong>.
              </p>
            </div>

            {/* Section 4: Practical Example: Multi-Channel Notification Service */}
            <div style={{ marginBottom: '28px' }} id="sec-4">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                4. Practical Example: Multi-Channel Alert Dispatcher
              </h2>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Let's apply interfaces to another critical domain: constructing an alerting and incident dispatch subsystem for a cloud observability platform.
              </p>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: '4px' }}>
                When infrastructure metrics breach thresholds, the system must dispatch alerts. Some on-call engineers require <strong>Email</strong>, incident response teams listen on <strong>Slack</strong>, and automated remediation runs through <strong>Webhooks</strong>.
              </p>

              {/* Multi-Channel CodeStudio */}
              <div style={{ margin: '14px 0' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Code: Pluggable Notification Dispatcher
                </div>
                <CodeStudio
                  snippets={notificationSnippets}
                  initialLanguage={selectedLanguage}
                  onLanguageChange={onSelectLanguage}
                  showRun={true}
                />
              </div>

              {/* DesignLoop Why Cards */}
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  Why This Design Works
                </h3>

                <div className="dl-why-grid">
                  <div className="dl-why-card">
                    <div className="dl-why-header">
                      <div className="dl-why-icon-wrap">
                        <CheckCircle2 size={16} />
                      </div>
                      <span>Seamless Extensibility</span>
                    </div>
                    <div className="dl-why-text">
                      Need PagerDuty or Discord? Create a new notifier class implementing <code className="inline-code">NotificationService</code>. The AlertService works with it immediately without modification.
                    </div>
                  </div>

                  <div className="dl-why-card">
                    <div className="dl-why-header">
                      <div className="dl-why-icon-wrap">
                        <CheckCircle2 size={16} />
                      </div>
                      <span>Independent Testability</span>
                    </div>
                    <div className="dl-why-text">
                      You can unit test <code className="inline-code">EmailNotifier</code> in isolation to verify message formatting without invoking external Slack servers or webhooks.
                    </div>
                  </div>

                  <div className="dl-why-card">
                    <div className="dl-why-header">
                      <div className="dl-why-icon-wrap">
                        <CheckCircle2 size={16} />
                      </div>
                      <span>Channel-Agnostic Core</span>
                    </div>
                    <div className="dl-why-text">
                      The alert service does not import concrete notifiers; it depends solely on the interface contract, protecting core business rules from vendor SDK changes.
                    </div>
                  </div>

                  <div className="dl-why-card">
                    <div className="dl-why-header">
                      <div className="dl-why-icon-wrap">
                        <CheckCircle2 size={16} />
                      </div>
                      <span>Config-Driven Routing</span>
                    </div>
                    <div className="dl-why-text">
                      Read active channels from environment variables or configs at startup and inject the appropriate notifier dynamically without code alterations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : chapter.moduleId === 'oop' ? (
          <>
            {/* Dynamic Sections for other OOP chapters */}
            {chapter.sections?.map((sec, idx) => (
              <div key={sec.id} style={{ marginBottom: '24px' }} id={`sec-${idx + 1}`}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.02em' }}>
                  {sec.title}
                </h2>
                
                {renderFormattedBlock(sec.content)}

                {sec.callout && (
                  <div
                    style={{
                      margin: '16px 0',
                      padding: '14px 18px',
                      borderRadius: 'var(--r-md)',
                      background: sec.callout.type === 'tip' ? 'var(--brand-emerald-subtle)' : 'var(--brand-primary-subtle)',
                      borderLeft: `4px solid ${sec.callout.type === 'tip' ? 'var(--brand-emerald)' : 'var(--brand-primary)'}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <Lightbulb size={20} color={sec.callout.type === 'tip' ? 'var(--brand-emerald)' : 'var(--brand-primary)'} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                        {sec.callout.title}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {sec.callout.text}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Reference Implementation CodeStudio */}
            {chapter.codeSnippets && (
              <div style={{ marginBottom: '28px' }} id="sec-code">
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.02em' }}>
                  Implementation Code & Live Sandbox
                </h2>
                <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Review and run the standard multi-language implementation for {chapter.title}:
                </p>
                <CodeStudio
                  snippets={chapter.codeSnippets}
                  sampleOutput={chapter.sampleOutput}
                  initialLanguage={selectedLanguage}
                  onLanguageChange={onSelectLanguage}
                  showRun={true}
                />
              </div>
            )}

            {/* Practice Problem banner */}
            {chapter.hasPracticeProblem && chapter.practiceProblemId && (
              <div
                id="sec-practice"
                style={{
                  marginBottom: '28px',
                  padding: '22px',
                  borderRadius: 'var(--r-xl)',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.12))',
                  border: '1.5px solid var(--brand-primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', fontWeight: 800, fontSize: '0.92rem', marginBottom: '4px' }}>
                    <Sparkles size={18} />
                    <span>Hands-On 7-Step LLD Challenge Available</span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Put {chapter.title} Into Production Practice
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
                    Step through real requirements, clarify edge cases, design class diagrams, and test against requirement mutations in our interactive studio.
                  </p>
                </div>

                <button
                  className="dl-dock-primary-btn"
                  style={{ padding: '12px 22px', borderRadius: 'var(--r-md)', whiteSpace: 'nowrap', cursor: 'pointer' }}
                  onClick={() => onNavigateToPractice && onNavigateToPractice(chapter.practiceProblemId!)}
                >
                  <span>Solve in Studio</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Coming Soon View for all non-OOP modules */
          <div
            style={{
              marginTop: '16px',
              marginBottom: '28px',
              padding: '38px 24px',
              borderRadius: 'var(--r-xl)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--r-xl)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.2))',
                border: '1px solid var(--brand-primary-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.18)',
              }}
            >
              <Clock size={30} />
            </div>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px' }}>
                <Sparkles size={13} />
                <span>Chapter In Development</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {chapter.title} &mdash; Coming Soon
              </h3>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', maxWidth: '560px', lineHeight: 1.6, margin: '0 auto' }}>
                We are actively handcrafting interactive architecture blueprints, multi-language sandbox playgrounds (Java, Python, C++, TS, Go), and production domain practice challenges for this topic.
              </p>
            </div>

            <div
              style={{
                width: '100%',
                maxWidth: '560px',
                padding: '16px 20px',
                borderRadius: 'var(--r-lg)',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} style={{ color: 'var(--brand-primary)' }} />
                <span>Planned Coverage for This Topic:</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div>• Deep architectural mental models & real-world production analogies</div>
                <div>• Live interactive DesignLoop UML and realization diagrams</div>
                <div>• Production code implementations across Java, Python, C++, TypeScript, and Go</div>
                <div>• Hands-on 7-Step LLD interview challenges with mutation testing</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
              <button
                onClick={() => {
                  if (!notifiedChapters.includes(chapter.id)) {
                    setNotifiedChapters([...notifiedChapters, chapter.id]);
                  }
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--r-md)',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: notifiedChapters.includes(chapter.id) ? 'var(--brand-emerald-subtle)' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                  color: notifiedChapters.includes(chapter.id) ? 'var(--brand-emerald)' : '#ffffff',
                  boxShadow: notifiedChapters.includes(chapter.id) ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                {notifiedChapters.includes(chapter.id) ? (
                  <>
                    <Check size={16} />
                    <span>Notification Enabled</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Notify Me When Live</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onSelectChapter('classes-and-objects')}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--r-md)',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>← Explore OOP Fundamentals</span>
              </button>
            </div>
          </div>
        )}

        {/* Section: Concept Quiz (Only for OOP chapters) */}
        {chapter.moduleId === 'oop' && (
          <div style={{ marginBottom: '24px' }} id="sec-quiz">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Concept Check Quiz
            </h2>

            <div
              style={{
                padding: '18px',
                borderRadius: 'var(--r-lg)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                {chapter.quiz?.question || 'Which of the following best describes the core design goal of this architectural pattern?'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(chapter.quiz?.options || [
                  'Guarantees strict encapsulation and isolates volatile state from callers.',
                  'Replaces all polymorphic interfaces with static concrete classes.',
                  'Enforces compile-time single inheritance across all domains.',
                  'Eliminates runtime heap memory allocation completely.',
                ]).map((opt, idx) => {
                  const correctIdx = chapter.quiz?.correctOptionIndex ?? 0;
                  const isSelected = selectedQuizOption === idx;
                  const isCorrect = idx === correctIdx;

                  let btnBg = 'var(--bg-surface-subtle)';
                  let btnBorder = 'var(--border-subtle)';
                  let btnColor = 'var(--text-primary)';

                  if (quizSubmitted) {
                    if (isCorrect) {
                      btnBg = 'var(--brand-emerald-subtle)';
                      btnBorder = 'var(--brand-emerald)';
                      btnColor = 'var(--brand-emerald)';
                    } else if (isSelected && !isCorrect) {
                      btnBg = 'var(--brand-rose-subtle)';
                      btnBorder = 'var(--brand-rose)';
                      btnColor = 'var(--brand-rose)';
                    }
                  } else if (isSelected) {
                    btnBg = 'var(--brand-primary-subtle)';
                    btnBorder = 'var(--brand-primary)';
                    btnColor = 'var(--brand-primary)';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !quizSubmitted && setSelectedQuizOption(idx)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--r-md)',
                        background: btnBg,
                        border: `1.5px solid ${btnBorder}`,
                        color: btnColor,
                        fontSize: '0.86rem',
                        fontWeight: isSelected ? 700 : 500,
                        textAlign: 'left',
                        cursor: quizSubmitted ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && isCorrect && <Check size={16} color="var(--brand-emerald)" />}
                    </button>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  disabled={selectedQuizOption === null}
                  onClick={() => setQuizSubmitted(true)}
                  style={{
                    marginTop: '14px',
                    padding: '8px 20px',
                    borderRadius: 'var(--r-md)',
                    background: selectedQuizOption === null ? 'var(--bg-surface-subtle)' : 'var(--brand-primary)',
                    color: selectedQuizOption === null ? 'var(--text-muted)' : '#ffffff',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: selectedQuizOption === null ? 'not-allowed' : 'pointer',
                  }}
                >
                  Submit Answer
                </button>
              ) : (
                <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--brand-emerald-subtle)', color: 'var(--brand-emerald)', fontSize: '0.84rem', fontWeight: 600 }}>
                  {chapter.quiz?.explanation || 'Correct! This pattern encapsulates volatile business logic and ensures structural invariants are maintained.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DesignLoop Signature Floating Bottom Navigation Dock */}
        <div className="dl-bottom-dock">
          {prevChapter ? (
            <button
              className="dl-dock-btn"
              onClick={() => onSelectChapter(prevChapter.id)}
            >
              <ChevronLeft size={16} />
              <span>{prevChapter.title}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="dl-dock-center-actions">
            <button className="dl-dock-action-pill" onClick={() => setIsNotesOpen(true)}>
              <BookOpen size={14} />
              <span>Notes</span>
            </button>

            <button className="dl-dock-action-pill" onClick={() => onToggleStar(chapter.id)}>
              <Star
                size={14}
                fill={starredChapterIds.includes(chapter.id) ? '#f59e0b' : 'none'}
                color={starredChapterIds.includes(chapter.id) ? '#f59e0b' : 'currentColor'}
              />
              <span>Star</span>
            </button>

            <button className="dl-dock-action-pill" onClick={() => onToggleComplete(chapter.id)}>
              <CheckCircle2
                size={14}
                color={completedChapterIds.includes(chapter.id) ? '#10b981' : 'currentColor'}
              />
              <span>{completedChapterIds.includes(chapter.id) ? 'Completed' : 'Mark Done'}</span>
            </button>

            <div className="dl-dock-divider" />

            <button className="dl-dock-action-pill" onClick={() => setIsAskAIOpen(true)} style={{ color: '#8b5cf6' }}>
              <Sparkles size={14} />
              <span>Ask AI</span>
            </button>
          </div>

          {nextChapter ? (
            <button
              className="dl-dock-btn dl-dock-primary-btn"
              onClick={() => onSelectChapter(nextChapter.id)}
            >
              <span>{nextChapter.title}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="dl-dock-btn dl-dock-primary-btn"
              onClick={onBackToHome}
            >
              <span>Complete Course</span>
              <Check size={16} />
            </button>
          )}
        </div>
      </main>

      {/* Right context and widgets column */}
      <aside className="reader-right-col">
        <div className="reader-sidebar-widget">
          <div className="widget-header-title">
            <FileText size={16} className="text-muted" />
            <span>On This Page</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {chapter.id === 'classes-and-objects' ? (
              <>
                <a
                  href="#sec-1"
                  className={`toc-link-item ${activeTocId === 'sec-1' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-1')}
                >
                  1. What is a Class?
                </a>
                <a
                  href="#sec-2"
                  className={`toc-link-item ${activeTocId === 'sec-2' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-2')}
                >
                  2. What is an Object?
                </a>
                <a
                  href="#sec-3"
                  className={`toc-link-item ${activeTocId === 'sec-3' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-3')}
                >
                  3. Practical Example: Food Order
                </a>
                <a
                  href="#sec-4"
                  className={`toc-link-item ${activeTocId === 'sec-4' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-4')}
                >
                  4. Why This Design Works
                </a>
                <a
                  href="#sec-quiz"
                  className={`toc-link-item ${activeTocId === 'sec-quiz' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-quiz')}
                >
                  5. Concept Quiz
                </a>
              </>
            ) : chapter.id === 'interfaces' ? (
              <>
                <a
                  href="#sec-1"
                  className={`toc-link-item ${activeTocId === 'sec-1' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-1')}
                >
                  1. What is an Interface?
                </a>
                <a
                  href="#sec-2"
                  className={`toc-link-item ${activeTocId === 'sec-2' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-2')}
                >
                  2. Key Properties
                </a>
                <a
                  href="#sec-3"
                  className={`toc-link-item ${activeTocId === 'sec-3' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-3')}
                >
                  3. Payment Gateway
                </a>
                <a
                  href="#sec-4"
                  className={`toc-link-item ${activeTocId === 'sec-4' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-4')}
                >
                  4. Notification Service
                </a>
                <a
                  href="#sec-quiz"
                  className={`toc-link-item ${activeTocId === 'sec-quiz' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-quiz')}
                >
                  5. Concept Quiz
                </a>
              </>
            ) : chapter.moduleId === 'oop' ? (
              <>
                {chapter.sections?.map((s, idx) => (
                  <a
                    key={s.id}
                    href={`#sec-${idx + 1}`}
                    className={`toc-link-item ${activeTocId === `sec-${idx + 1}` ? 'active' : ''}`}
                    onClick={() => setActiveTocId(`sec-${idx + 1}`)}
                  >
                    {s.title}
                  </a>
                ))}
                {chapter.codeSnippets && (
                  <a
                    href="#sec-code"
                    className={`toc-link-item ${activeTocId === 'sec-code' ? 'active' : ''}`}
                    onClick={() => setActiveTocId('sec-code')}
                  >
                    Code & Sandbox
                  </a>
                )}
                {chapter.hasPracticeProblem && (
                  <a
                    href="#sec-practice"
                    className={`toc-link-item ${activeTocId === 'sec-practice' ? 'active' : ''}`}
                    onClick={() => setActiveTocId('sec-practice')}
                  >
                    Practice In Studio
                  </a>
                )}
                <a
                  href="#sec-quiz"
                  className={`toc-link-item ${activeTocId === 'sec-quiz' ? 'active' : ''}`}
                  onClick={() => setActiveTocId('sec-quiz')}
                >
                  Concept Quiz
                </a>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
                <div style={{ padding: '10px 12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary)', fontWeight: 700, marginBottom: '4px' }}>
                    <Clock size={14} />
                    <span>Status: In Development</span>
                  </div>
                  <p style={{ fontSize: '0.76rem', lineHeight: 1.4 }}>
                    Interactive blueprints and code sandboxes for this chapter will be available soon.
                  </p>
                </div>
                <button
                  onClick={() => onSelectChapter('classes-and-objects')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--brand-primary-subtle)',
                    border: '1px solid var(--brand-primary-border)',
                    color: 'var(--brand-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  ← Learn OOP Fundamentals
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="reader-sidebar-widget">
          <div className="widget-header-title">
            <LinkIcon size={16} className="text-muted" />
            <span>Related Concepts</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {relatedConcepts.map((item, idx) => (
              <div
                key={idx}
                className="related-link-row"
                onClick={() => onSelectChapter(item.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={14} className="text-muted" />
                  <span>{item.title}</span>
                </div>
                <ChevronRight size={14} className="text-muted" />
              </div>
            ))}
          </div>
        </div>

        <div
          className="reader-sidebar-widget"
          style={{
            background: 'linear-gradient(145deg, #ecfdf5, #f0fdf4)',
            border: '1px solid #bbf7d0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800, fontSize: '0.88rem' }}>
            <MessageSquare size={17} />
            <span>Stuck somewhere?</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#065f46', marginTop: '6px', lineHeight: 1.4 }}>
            Ask our AI tutor for hints, explanations, or alternative ways to think about this.
          </p>
          <button
            onClick={() => setIsAskAIOpen(true)}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '8px 14px',
              borderRadius: 'var(--r-md)',
              background: '#ffffff',
              border: '1px solid #86efac',
              color: '#059669',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Ask AI</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </aside>

      {isNotesOpen && (
        <NotesModal
          isOpen={isNotesOpen}
          chapterId={chapter.id}
          chapterTitle={chapter.title}
          notes={chapterNotes}
          onSaveNote={onSaveNote}
          onClose={() => setIsNotesOpen(false)}
        />
      )}

      {isUMLOpen && (
        <UMLModal
          isOpen={isUMLOpen}
          title={chapter.title}
          umlCard={chapter.umlCard}
          mermaidSyntax={chapter.classDiagramMermaid}
          onClose={() => setIsUMLOpen(false)}
        />
      )}

      {isAskAIOpen && (
        <AskAIDrawer
          isOpen={isAskAIOpen}
          contextTitle={chapter.title}
          contextSummary={`${chapter.title}: ${chapter.summary}`}
          settings={settings}
          onClose={() => setIsAskAIOpen(false)}
        />
      )}
    </div>
  );
};
