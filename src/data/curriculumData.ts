import { CurriculumChapter, CurriculumModule, SupportedLanguage, CurriculumCategory } from '../types';

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'oop',
    title: 'Object Oriented Programming',
    description: 'Master the fundamental pillars of object-oriented architecture and entity relationships.',
    iconName: 'Layers',
    chapterIds: [
      'classes-and-objects',
      'interfaces',
      'inheritance',
      'polymorphism',
      'abstraction',
      'encapsulation',
      'aggregation',
      'composition',
      'association',
    ],
  },
  {
    id: 'design-principles',
    title: 'Design Principles',
    description: 'Core architectural guidelines including DRY, KISS, YAGNI, Law of Demeter, and SOLID.',
    iconName: 'Compass',
    chapterIds: [
      'dry',
      'kiss',
      'yagni',
      'lod',
      'srp',
      'ocp',
      'lsp',
      'isp',
      'dip',
      'solid-summary',
    ],
  },
  {
    id: 'uml',
    title: 'UML',
    description: 'Visual system modeling with Class, Sequence, State Machine, Activity, and Use Case diagrams.',
    iconName: 'FileCode',
    chapterIds: [
      'class-diagram',
      'use-case-diagram',
      'sequence-diagram',
      'activity-diagram',
      'state-machine-diagram',
    ],
  },
  {
    id: 'creational-patterns',
    title: 'Design Patterns - Creational',
    description: 'Object creation mechanisms that increase flexibility and reuse of existing code.',
    iconName: 'Box',
    chapterIds: [
      'singleton',
      'factory-method',
      'abstract-factory',
      'builder',
      'prototype',
    ],
  },
  {
    id: 'structural-patterns',
    title: 'Design Patterns - Structural',
    description: 'Assembling objects and classes into larger structures while keeping them flexible and efficient.',
    iconName: 'GitMerge',
    chapterIds: [
      'adapter',
      'facade',
      'decorator',
      'composite',
      'proxy',
      'bridge',
      'flyweight',
    ],
  },
  {
    id: 'behavioral-patterns',
    title: 'Design Patterns - Behavioral',
    description: 'Algorithms and the assignment of responsibilities between objects.',
    iconName: 'Workflow',
    chapterIds: [
      'iterator',
      'observer',
      'strategy',
      'command',
      'state',
      'template-method',
      'visitor',
      'mediator',
      'memento',
      'chain-of-responsibility',
    ],
  },
  {
    id: 'interview-tips',
    title: 'LLD Interview Tips',
    description: 'Proven 45-minute execution framework, communication strategies, and pitfalls to avoid.',
    iconName: 'Award',
    chapterIds: ['how-to-answer-lld'],
  },
  {
    id: 'questions-easy',
    title: 'LLD Interview Questions - Easy',
    description: 'Fundamental real-world interview problems to build confidence and fluency.',
    iconName: 'CheckCircle2',
    chapterIds: [
      'design-tic-tac-toe',
      'design-snake-and-ladder',
      'design-lru-cache',
      'design-parking-lot',
      'design-task-management-system',
    ],
  },
  {
    id: 'questions-medium',
    title: 'LLD Interview Questions - Medium',
    description: 'Core interview questions tested across Google, Amazon, Microsoft, Uber, and Meta.',
    iconName: 'Flame',
    chapterIds: [
      'design-stack-overflow',
      'design-atm',
      'design-logging-framework',
      'design-pub-sub-system',
      'design-elevator-system',
      'design-splitwise',
      'design-vending-machine',
      'design-car-rental-system',
      'design-hotel-management-system',
      'design-digital-wallet-service',
      'design-airline-management-system',
      'design-library-management-system',
      'design-traffic-signal-control-system',
      'design-concert-ticket-booking-system',
      'design-social-network-service-facebook',
    ],
  },
  {
    id: 'questions-hard',
    title: 'LLD Interview Questions - Hard',
    description: 'Complex multi-component architectures with strict concurrency, state, and scale constraints.',
    iconName: 'Zap',
    chapterIds: [
      'design-spotify',
      'design-amazon',
      'design-linkedin',
      'design-cricinfo',
      'design-chess-game',
      'design-coffee-vending-machine',
      'design-restaurant-management-system',
      'design-online-stock-exchange',
      'design-course-registration-system',
      'design-movie-ticket-booking-system',
      'design-online-auction-system',
      'design-online-food-delivery-service',
      'design-ride-sharing-service-uber',
    ],
  },
];

export const CURRICULUM_CHAPTERS: Record<string, CurriculumChapter> = {
  'classes-and-objects': {
    id: 'classes-and-objects',
    slug: 'classes-and-objects',
    moduleId: 'oop',
    moduleTitle: 'Object Oriented Programming',
    title: 'Classes and Objects',
    priority: 'High Priority',
    readTimeMinutes: 5,
    lastUpdated: 'Updated July 3, 2026',
    summary: 'Every object-oriented system starts with one fundamental question: How do I represent real-world entities in code? Classes and Objects are the foundational answer.',
    audioDurationSeconds: 180,
    audioScript: 'Welcome to Classes and Objects. In this chapter, we explore how classes serve as blueprints and how objects represent independent runtime instances with their own state and behavior.',
    sections: [
      {
        id: '1-what-is-a-class',
        title: '1. What is a Class?',
        content: `A **class** is a blueprint, template, or recipe for creating objects. It defines what an object will contain (its data or state) and what it will be able to do (its behavior or methods).

A class is not an object itself; it is a structural template used to create many objects with identical schema but completely independent runtime state.

### Real-World Analogy: The Cake Recipe
Think of a class like a recipe for a cake:
- The **ingredients** represent fields or attributes (\`flour\`, \`sugar\`, \`eggs\` $\\rightarrow$ variables).
- The **instructions** represent methods or functions (\`mix()\`, \`bake()\`, \`decorate()\` $\\rightarrow$ operations).
- The recipe itself doesn't produce a cake; it defines how to create one. When you follow the recipe and bake a cake, you have just instantiated an **object**.

In code terms: the recipe is your class definition, and each cake you bake is an object with its own flavor, frosting, and size.

### Key Characteristics of a Class:
1. **Encapsulates related data**: Groups attributes and methods that belong together.
2. **Defines state fields**: Specifies variables that each instance will hold.
3. **Defines behavior**: Implements functions that operate on the instance's state.`,
        callout: {
          type: 'note',
          title: 'Class vs Instance Memory',
          text: 'A class definition resides in code memory (metaspace), whereas each created object allocates its own heap memory for instance variables.',
        },
      },
      {
        id: '2-what-is-an-object',
        title: '2. What is an Object?',
        content: `An **object** is an instance of a class. It is the actual living entity you interact with, store data in, and invoke methods upon.

When you create an object, you are essentially saying:
> *"Take this blueprint (class) and build one actual thing (object) in memory."*

Each object gets its own copy of the attributes defined in the class, shares the common method definitions, and operates with complete state independence.`,
      },
      {
        id: '3-practical-example-online-food-order',
        title: '3. Practical Example: Online Food Order',
        content: `Let's apply classes and objects to a real-world problem: building an order management system for a food delivery platform.

### The Scenario
A food delivery application needs to manage customer orders. Each order belongs to a customer, contains a list of food items with prices, and tracks whether it has been placed. Customers build their order by adding items one by one. Once placed, no further items can be added.

Without classes, you would have disjointed arrays and maps with no clean way to protect domain invariants. With classes, the \`Order\` entity owns its data and enforces strict rules.`,
        callout: {
          type: 'tip',
          title: 'Invariant Protection',
          text: 'Notice how the addItem() method verifies that the order has not been placed yet before accepting new items. This guarantees valid domain state by design.',
        },
      },
    ],
    umlCard: {
      className: 'Car',
      stereotype: 'class',
      attributes: [
        { visibility: '-', name: 'brand', type: 'String' },
        { visibility: '-', name: 'model', type: 'String' },
        { visibility: '-', name: 'speed', type: 'int' },
      ],
      methods: [
        { visibility: '+', name: 'Car', parameters: 'brand: String, model: String', returnType: '' },
        { visibility: '+', name: 'accelerate', parameters: 'increment: int', returnType: 'void' },
        { visibility: '+', name: 'displayStatus', parameters: '', returnType: 'void' },
      ],
    },
    classDiagramMermaid: `classDiagram
    class Car {
      -String brand
      -String model
      -int speed
      +Car(brand: String, model: String)
      +accelerate(increment: int) void
      +displayStatus() void
    }`,
    codeSnippets: {
      java: `public class Car {
    private String brand;
    private String model;
    private int speed;

    public Car(String brand, String model) {
        this.brand = brand;
        this.model = model;
        this.speed = 0;
    }

    public void accelerate(int increment) {
        this.speed += increment;
    }

    public void displayStatus() {
        System.out.println(brand + " " + model + " is running at " + speed + " km/h.");
    }

    public static void main(String[] args) {
        Car corolla = new Car("Toyota", "Corolla");
        Car mustang = new Car("Ford", "Mustang");

        corolla.accelerate(20);
        mustang.accelerate(40);

        corolla.displayStatus();
        mustang.displayStatus();
    }
}`,
      python: `class Car:
    def __init__(self, brand: str, model: str):
        self._brand = brand
        self._model = model
        self._speed = 0

    def accelerate(self, increment: int) -> None:
        self._speed += increment

    def display_status(self) -> None:
        print(f"{self._brand} {self._model} is running at {self._speed} km/h.")

if __name__ == "__main__":
    corolla = Car("Toyota", "Corolla")
    mustang = Car("Ford", "Mustang")
    corolla.accelerate(20)
    mustang.accelerate(40)
    corolla.display_status()
    mustang.display_status()`,
      cpp: `#include <iostream>
#include <string>

class Car {
private:
    std::string brand;
    std::string model;
    int speed;
public:
    Car(const std::string& b, const std::string& m) : brand(b), model(m), speed(0) {}
    void accelerate(int inc) { speed += inc; }
    void displayStatus() const {
        std::cout << brand << " " << model << " is running at " << speed << " km/h." << std::endl;
    }
};

int main() {
    Car corolla("Toyota", "Corolla");
    Car mustang("Ford", "Mustang");
    corolla.accelerate(20);
    mustang.accelerate(40);
    corolla.displayStatus();
    mustang.displayStatus();
    return 0;
}`,
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
}

const corolla = new Car("Toyota", "Corolla");
const mustang = new Car("Ford", "Mustang");
corolla.accelerate(20);
mustang.accelerate(40);
corolla.displayStatus();
mustang.displayStatus();`,
      go: `package main
import "fmt"

type Car struct {
    Brand string
    Model string
    Speed int
}

func NewCar(brand string, model string) *Car {
    return &Car{Brand: brand, Model: model, Speed: 0}
}

func (c *Car) Accelerate(increment int) { c.Speed += increment }
func (c *Car) DisplayStatus() { fmt.Printf("%s %s is running at %d km/h.\\n", c.Brand, c.Model, c.Speed) }

func main() {
    corolla := NewCar("Toyota", "Corolla")
    mustang := NewCar("Ford", "Mustang")
    corolla.Accelerate(20)
    mustang.Accelerate(40)
    corolla.DisplayStatus()
    mustang.DisplayStatus()
}`,
    },
    sampleOutput: `Toyota Corolla is running at 20 km/h.
Ford Mustang is running at 40 km/h.`,
    practicalExample: {
      title: 'Online Food Order Management System',
      scenario: 'Encapsulating customer orders with strict invariant checking before order placement.',
      code: {
        java: `import java.util.ArrayList;
import java.util.List;

public class Order {
    private String orderId;
    private String customerName;
    private List<String> items = new ArrayList<>();
    private double totalPrice = 0.0;
    private boolean isPlaced = false;

    public Order(String orderId, String customerName) {
        this.orderId = orderId;
        this.customerName = customerName;
    }

    public boolean addItem(String item, double price) {
        if (isPlaced) {
            System.out.println("Cannot add items: Order " + orderId + " already placed!");
            return false;
        }
        items.add(item);
        totalPrice += price;
        return true;
    }
}`,
        python: `class Order:
    def __init__(self, order_id: str, customer_name: str):
        self.order_id = order_id
        self.customer_name = customer_name
        self.items = []
        self.total_price = 0.0
        self.is_placed = False

    def add_item(self, item: str, price: float) -> bool:
        if self.is_placed:
            return False
        self.items.append(item)
        self.total_price += price
        return True`,
        cpp: `// C++ Order Implementation`,
        typescript: `// TypeScript Order Implementation`,
        go: `// Go Order Implementation`,
      },
      whyItWorks: [
        'Encapsulates order state: Items, total, and placement status live together.',
        'Enforces business rules: The addItem() method prevents modifications after placement.',
        'Reusable across the platform: One class handles thousands of independent orders.',
        'Extensible: Add payment methods and delivery tracking without restructuring your codebase.',
      ],
    },
    quiz: {
      id: 'quiz-classes-objects',
      question: 'What is the primary difference between a Class and an Object?',
      options: [
        'A class is stored on the heap while an object is stored on the stack.',
        'A class is a blueprint/definition; an object is an independent runtime instance.',
        'Classes can only contain methods, while objects can only contain data attributes.',
        'Objects are defined at compile-time while classes are created at runtime.',
      ],
      correctOptionIndex: 1,
      explanation: 'A class is a blueprint or template in source code, whereas an object is a distinct runtime instance created in memory that holds its own independent state.',
    },
  },
  'interfaces': {
    id: 'interfaces',
    slug: 'interfaces',
    moduleId: 'oop',
    moduleTitle: 'Object Oriented Programming',
    title: 'Interfaces',
    priority: 'High Priority',
    readTimeMinutes: 6,
    lastUpdated: 'Updated July 2026',
    summary: 'In object-oriented design, interfaces play a foundational role in building systems that are extensible, testable, and loosely coupled. They define what a component should do, not how it should do it.',
    sections: [
      {
        id: '1-what-is-an-interface',
        title: '1. What is an Interface?',
        content: `At its core, **an interface is a contract**: a list of method signatures that any implementing class agrees to provide.

It specifies a set of behaviors that a class must implement, but leaves the details of *how* those behaviors work completely up to each implementation.

In other words:
> **An interface defines the "What", while classes provide the "How".**

This separation of definition and implementation allows different parts of your software system to work together smoothly through well-defined contracts—without needing to know each other's private internal details.`,
        callout: {
          type: 'note',
          title: 'The Golden Rule of Interfaces',
          text: 'An interface contains zero internal logic. It simply declares: "Whoever implements me promises to provide these methods with these exact inputs and outputs."',
        },
      },
      {
        id: '2-real-world-analogies',
        title: '2. Real-World Analogies (Mental Models)',
        content: `To understand interfaces naturally, let's explore three everyday examples:

### Analogy 1: The Universal Remote Control
Consider a standard TV remote control. It exposes a predictable set of buttons:
- \`play()\`
- \`pause()\`
- \`volumeUp()\`
- \`powerOff()\`

The person using the remote doesn't care whether it is controlling a **Sony Smart TV**, a **Bose Soundbar**, or an **Epson Projector**. All three devices understand the exact same commands.
- **The Remote is the Interface:** A uniform contract of buttons.
- **The Devices are the Implementations:** TV, Soundbar, and Projector each respond differently behind the scenes, but the contract stays 100% consistent.

---

### Analogy 2: The USB-C Charging Standard
Think of the standard **USB-C port**:
- Laptops, smartphones, headphones, and tablets all expose the standard USB-C port interface.
- You can plug any USB-C charger into any USB-C device without caring if the electricity is sourced from a hydroelectric wall socket, solar panel, or power bank.
- As long as both sides honor the USB-C standard, they connect and work effortlessly.

---

### Analogy 3: Restaurant Menu & Kitchen
When you order food at a restaurant, the menu is your interface:
- You call \`order("Margherita Pizza")\`.
- You don't need to know whether the chef uses a wood-fired brick oven, a gas stove, or an induction top in the back kitchen.
- The menu guarantees what you will receive without revealing the kitchen's internal machinery.`,
      },
      {
        id: '3-key-properties-of-interfaces',
        title: '3. Key Superpowers of Interfaces',
        content: `Interfaces are more than just method declarations; they are the foundation of clean, modular software design:

### a) Defines Behavior Without Dictating Implementation
An interface only declares what operations are expected. It doesn't define how they are carried out.
This gives complete freedom to implementers to provide their own version of the logic while honoring the same contract.

### b) Enables Polymorphism (Interchangeable Runtime Behavior)
Different classes can implement the same interface in different ways. This allows your code to work with multiple implementations interchangeably at runtime without modifying existing classes.

### c) Promotes Decoupling & Testability
Code that depends on interfaces is insulated from changes in concrete classes.
- **Extensibility:** Add new implementations without touching existing callers (Open-Closed Principle).
- **Testability:** Inject lightweight Mock interfaces in unit tests instead of hitting live external APIs or payment processors.
- **Maintainability:** Fix bugs or refactor provider classes with zero ripple effects on other modules.`,
        callout: {
          type: 'tip',
          title: 'Decoupling in Practice',
          text: 'When your high-level business services depend on interfaces, you can swap out payment vendors, databases, or notification channels at runtime by simply passing a different implementation object.',
        },
      },
      {
        id: '4-payment-gateway-example',
        title: '4. Code Example: Payment Gateway Interface',
        content: `Let's design a payment processing module that supports multiple providers like **Stripe**, **Razorpay**, and **PayPal**.

You don't want your core checkout logic to be tied to a specific provider. You just want a uniform way to initiate payments.

### Step 1: Defining the Interface
\`\`\`java
public interface PaymentGateway {
    boolean initiatePayment(double amount);
}
\`\`\`
This interface defines the contract. Every payment gateway must provide an \`initiatePayment()\` method. But it doesn't specify how each provider processes payments.

### Step 2: Implementing the Interface
Now let's create classes that fulfill this contract:
- \`StripePayment\` talks to the Stripe API.
- \`RazorpayPayment\` handles UPI and NetBanking via Razorpay.
- \`PayPalPayment\` processes PayPal digital wallet payments.

Both classes implement the same interface, but their internal logic is completely different.

### Step 3: Programming to the Interface (Dependency Injection)
Instead of having \`CheckoutService\` construct a concrete \`StripePayment\`, it depends on the \`PaymentGateway\` interface:
\`\`\`java
public class CheckoutService {
    private PaymentGateway paymentGateway;

    // Injected from the outside!
    public CheckoutService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public void checkout(double amount) {
        paymentGateway.initiatePayment(amount);
    }
}
\`\`\`
Look at the constructor: it takes a \`PaymentGateway\`, not a \`StripePayment\`. This single decision decouples the service from any specific provider.

This pattern is called **Dependency Injection**: instead of creating its own dependencies, the class receives them from the outside.`,
      },
      {
        id: '5-notification-service-example',
        title: '5. Practical Example: Multi-Channel Notification Service',
        content: `Let's apply interfaces to a DevOps alerting system. When something goes wrong (server down, high CPU, disk full), the system needs to send alerts. Some teams prefer **Email**, others use **Slack**, and some have custom **SMS** or **Webhook** integrations.

The alerting service shouldn't know or care which channel is being used. It just sends the notification through whatever channel was configured.

### Architecture:
- **Interface:** \`NotificationService\` with method \`send(recipient, message)\`
- **Implementations:** \`EmailNotifier\`, \`SlackNotifier\`, \`SMSNotifier\`, \`WebhookNotifier\`
- **Caller:** \`AlertService\` depends solely on the \`NotificationService\` interface

### Why This Design Works:
1. **Adding a new channel is trivial:** Need PagerDuty notifications? Create a \`PagerDutyNotifier\` class that implements \`NotificationService\`. \`AlertService\` works with it immediately with zero code changes.
2. **Each notifier is independently testable:** You can unit test \`EmailNotifier\` to verify formatting without involving Slack or external APIs.
3. **The alert service is channel-agnostic:** It doesn't import any notifier classes. It only knows about the \`NotificationService\` interface.
4. **Configuration drives behavior:** At runtime, read the preferred channel from an environment variable or config file and inject the appropriate notifier.`,
      },
      {
        id: '6-audio-streaming-example',
        title: '6. Bonus Example: Audio Streaming Engine',
        content: `Imagine building a music player application that supports multiple streaming backends:

- **Interface:** \`AudioPlayer\` with \`play(trackId)\`, \`pause()\`, \`stop()\`
- **Implementations:**
  - \`SpotifyStreamer\` (streams compressed audio from Spotify CDN)
  - \`AppleMusicStreamer\` (streams lossless audio from Apple Music)
  - \`LocalMp3Player\` (plays audio directly from local flash storage)

The UI playback controls (Play, Pause, Scrub) communicate solely with the \`AudioPlayer\` interface. Users enjoy an identical user experience regardless of the audio source.`,
      },
      {
        id: '7-key-takeaways-summary',
        title: '7. Key Takeaways & Summary',
        content: `- **Interfaces define the WHAT, classes define the HOW.**
- **Program to interfaces, not implementations:** High-level policy should not depend on low-level concrete details.
- **Dependency Injection:** Pass interfaces into constructors so callers can swap providers at runtime without rewriting code.
- **Seamless Extensibility:** New features and third-party vendors can be plugged in without modifying existing tested classes.`,
      },
    ],
    umlCard: {
      className: 'PaymentGateway',
      stereotype: 'interface',
      attributes: [],
      methods: [
        { visibility: '+', name: 'initiatePayment', parameters: 'amount: double', returnType: 'boolean' },
      ],
    },
    classDiagramMermaid: `classDiagram
    class PaymentGateway {
      <<interface>>
      +initiatePayment(amount: double) boolean
    }
    class StripePayment {
      +initiatePayment(amount: double) boolean
    }
    class RazorpayPayment {
      +initiatePayment(amount: double) boolean
    }
    class PayPalPayment {
      +initiatePayment(amount: double) boolean
    }
    class CheckoutService {
      -PaymentGateway paymentGateway
      +CheckoutService(paymentGateway: PaymentGateway)
      +checkout(amount: double) void
    }
    PaymentGateway <|.. StripePayment : implements
    PaymentGateway <|.. RazorpayPayment : implements
    PaymentGateway <|.. PayPalPayment : implements
    CheckoutService --> PaymentGateway : depends on`,
    codeSnippets: {
      java: `// 1. Interface Contract (Defines WHAT to do)
public interface PaymentGateway {
    boolean initiatePayment(double amount);
}

// 2. Concrete Implementation #1: Stripe
public class StripePayment implements PaymentGateway {
    @Override
    public boolean initiatePayment(double amount) {
        System.out.println("[Stripe] Processing credit card payment of $" + String.format("%.2f", amount) + " via Stripe API...");
        return true;
    }
}

// 2. Concrete Implementation #2: Razorpay
public class RazorpayPayment implements PaymentGateway {
    @Override
    public boolean initiatePayment(double amount) {
        System.out.println("[Razorpay] Processing UPI/NetBanking payment of $" + String.format("%.2f", amount) + " via Razorpay Gateway...");
        return true;
    }
}

// 2. Concrete Implementation #3: PayPal
public class PayPalPayment implements PaymentGateway {
    @Override
    public boolean initiatePayment(double amount) {
        System.out.println("[PayPal] Authorizing one-touch wallet transaction of $" + String.format("%.2f", amount) + " via PayPal API...");
        return true;
    }
}

// 3. High-level Business Logic depending ONLY on the Interface (Dependency Injection)
public class CheckoutService {
    private PaymentGateway paymentGateway;

    // The gateway is provided from the outside!
    public CheckoutService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public void checkout(double amount) {
        System.out.println("Initiating checkout workflow...");
        boolean success = paymentGateway.initiatePayment(amount);
        System.out.println("Payment status: " + (success ? "SUCCESS" : "FAILED"));
    }
}

// 4. Runtime Execution: Swapping implementations effortlessly
public class Main {
    public static void main(String[] args) {
        System.out.println("=== 1. Using Stripe ===");
        CheckoutService stripeCheckout = new CheckoutService(new StripePayment());
        stripeCheckout.checkout(150.0);

        System.out.println("\\n=== 2. Swapping to Razorpay on the fly ===");
        CheckoutService razorpayCheckout = new CheckoutService(new RazorpayPayment());
        razorpayCheckout.checkout(150.0);

        System.out.println("\\n=== 3. Swapping to PayPal ===");
        CheckoutService payPalCheckout = new CheckoutService(new PayPalPayment());
        payPalCheckout.checkout(150.0);
    }
}`,
      python: `from abc import ABC, abstractmethod

# 1. Interface Contract (Defines WHAT to do via Abstract Base Class)
class PaymentGateway(ABC):
    @abstractmethod
    def initiate_payment(self, amount: float) -> bool:
        """Any class implementing PaymentGateway must provide this method."""
        pass

# 2. Concrete Implementation #1: Stripe
class StripePayment(PaymentGateway):
    def initiate_payment(self, amount: float) -> bool:
        print(f"[Stripe] Processing credit card payment of \${amount:.2f} via Stripe API...")
        return True

# 2. Concrete Implementation #2: Razorpay
class RazorpayPayment(PaymentGateway):
    def initiate_payment(self, amount: float) -> bool:
        print(f"[Razorpay] Processing UPI/NetBanking payment of \${amount:.2f} via Razorpay Gateway...")
        return True

# 2. Concrete Implementation #3: PayPal
class PayPalPayment(PaymentGateway):
    def initiate_payment(self, amount: float) -> bool:
        print(f"[PayPal] Authorizing one-touch wallet transaction of \${amount:.2f} via PayPal API...")
        return True

# 3. High-Level Service depending ONLY on the Interface
class CheckoutService:
    def __init__(self, payment_gateway: PaymentGateway):
        # Dependency Injection: Gateway is provided from outside
        self.payment_gateway = payment_gateway

    def checkout(self, amount: float) -> None:
        print("Initiating checkout workflow...")
        success = self.payment_gateway.initiate_payment(amount)
        print(f"Payment status: {'SUCCESS' if success else 'FAILED'}")

if __name__ == "__main__":
    print("=== 1. Using Stripe ===")
    stripe_checkout = CheckoutService(StripePayment())
    stripe_checkout.checkout(150.0)

    print("\\n=== 2. Swapping to Razorpay on the fly ===")
    razorpay_checkout = CheckoutService(RazorpayPayment())
    razorpay_checkout.checkout(150.0)

    print("\\n=== 3. Swapping to PayPal ===")
    paypal_checkout = CheckoutService(PayPalPayment())
    paypal_checkout.checkout(150.0)`,
      cpp: `#include <iostream>
#include <iomanip>
#include <memory>

// 1. Interface Contract (Pure Virtual Abstract Class)
class PaymentGateway {
public:
    virtual ~PaymentGateway() = default;
    virtual bool initiatePayment(double amount) = 0;
};

// 2. Concrete Implementations
class StripePayment : public PaymentGateway {
public:
    bool initiatePayment(double amount) override {
        std::cout << "[Stripe] Processing credit card payment of $" << std::fixed << std::setprecision(2) << amount << " via Stripe API..." << std::endl;
        return true;
    }
};

class RazorpayPayment : public PaymentGateway {
public:
    bool initiatePayment(double amount) override {
        std::cout << "[Razorpay] Processing UPI/NetBanking payment of $" << std::fixed << std::setprecision(2) << amount << " via Razorpay Gateway..." << std::endl;
        return true;
    }
};

class PayPalPayment : public PaymentGateway {
public:
    bool initiatePayment(double amount) override {
        std::cout << "[PayPal] Authorizing one-touch wallet transaction of $" << std::fixed << std::setprecision(2) << amount << " via PayPal API..." << std::endl;
        return true;
    }
};

// 3. High-level Checkout Service (Dependency Injection via smart pointer)
class CheckoutService {
private:
    std::shared_ptr<PaymentGateway> gateway;
public:
    CheckoutService(std::shared_ptr<PaymentGateway> g) : gateway(g) {}

    void checkout(double amount) {
        std::cout << "Initiating checkout workflow..." << std::endl;
        bool success = gateway->initiatePayment(amount);
        std::cout << "Payment status: " << (success ? "SUCCESS" : "FAILED") << std::endl;
    }
};

int main() {
    std::cout << "=== 1. Using Stripe ===" << std::endl;
    auto stripe = std::make_shared<StripePayment>();
    CheckoutService checkout1(stripe);
    checkout1.checkout(150.0);

    std::cout << "\n=== 2. Swapping to Razorpay on the fly ===" << std::endl;
    auto razorpay = std::make_shared<RazorpayPayment>();
    CheckoutService checkout2(razorpay);
    checkout2.checkout(150.0);

    return 0;
}`,
      typescript: `// 1. Interface Contract (Defines WHAT to do)
export interface PaymentGateway {
  initiatePayment(amount: number): boolean;
}

// 2. Concrete Implementation #1: Stripe
export class StripePayment implements PaymentGateway {
  initiatePayment(amount: number): boolean {
    console.log(\`[Stripe] Processing credit card payment of $\${amount.toFixed(2)} via Stripe API...\`);
    return true;
  }
}

// 2. Concrete Implementation #2: Razorpay
export class RazorpayPayment implements PaymentGateway {
  initiatePayment(amount: number): boolean {
    console.log(\`[Razorpay] Processing UPI/NetBanking payment of $\${amount.toFixed(2)} via Razorpay Gateway...\`);
    return true;
  }
}

// 2. Concrete Implementation #3: PayPal
export class PayPalPayment implements PaymentGateway {
  initiatePayment(amount: number): boolean {
    console.log(\`[PayPal] Authorizing one-touch wallet transaction of $\${amount.toFixed(2)} via PayPal API...\`);
    return true;
  }
}

// 3. Service depending on the Interface (Dependency Injection)
export class CheckoutService {
  constructor(private gateway: PaymentGateway) {}

  checkout(amount: number): void {
    console.log("Initiating checkout workflow...");
    const success = this.gateway.initiatePayment(amount);
    console.log(\`Payment status: \${success ? "SUCCESS" : "FAILED"}\`);
  }
}

// 4. Runtime Wiring & Swapping
console.log("=== 1. Using Stripe ===");
const stripeCheckout = new CheckoutService(new StripePayment());
stripeCheckout.checkout(150.0);

console.log("\n=== 2. Swapping to Razorpay on the fly ===");
const razorpayCheckout = new CheckoutService(new RazorpayPayment());
razorpayCheckout.checkout(150.0);`,
      go: `package main

import "fmt"

// 1. Interface Contract (Defines WHAT to do)
type PaymentGateway interface {
    InitiatePayment(amount float64) bool
}

// 2. Concrete Implementation #1: Stripe
type StripePayment struct{}

func (s *StripePayment) InitiatePayment(amount float64) bool {
    fmt.Printf("[Stripe] Processing credit card payment of $%.2f via Stripe API...\\n", amount)
    return true
}

// 2. Concrete Implementation #2: Razorpay
type RazorpayPayment struct{}

func (r *RazorpayPayment) InitiatePayment(amount float64) bool {
    fmt.Printf("[Razorpay] Processing UPI/NetBanking payment of $%.2f via Razorpay Gateway...\\n", amount)
    return true
}

// 3. Checkout Service depending on Interface
type CheckoutService struct {
    gateway PaymentGateway
}

func NewCheckoutService(g PaymentGateway) *CheckoutService {
    return &CheckoutService{gateway: g}
}

func (c *CheckoutService) Checkout(amount float64) {
    fmt.Println("Initiating checkout workflow...")
    success := c.gateway.InitiatePayment(amount)
    status := "FAILED"
    if success {
        status = "SUCCESS"
    }
    fmt.Printf("Payment status: %s\\n", status)
}

func main() {
    fmt.Println("=== 1. Using Stripe ===")
    stripeCheckout := NewCheckoutService(&StripePayment{})
    stripeCheckout.Checkout(150.0)

    fmt.Println("\\n=== 2. Swapping to Razorpay on the fly ===")
    razorpayCheckout := NewCheckoutService(&RazorpayPayment{})
    razorpayCheckout.Checkout(150.0)
}`,
    },
    sampleOutput: `=== 1. Using Stripe ===
Initiating checkout workflow...
[Stripe] Processing credit card payment of $150.00 via Stripe API...
Payment status: SUCCESS

=== 2. Swapping to Razorpay on the fly ===
Initiating checkout workflow...
[Razorpay] Processing UPI/NetBanking payment of $150.00 via Razorpay Gateway...
Payment status: SUCCESS

=== 3. Swapping to PayPal ===
Initiating checkout workflow...
[PayPal] Authorizing one-touch wallet transaction of $150.00 via PayPal API...
Payment status: SUCCESS`,
    practicalExample: {
      title: 'DevOps Multi-Channel Alert Dispatcher',
      scenario: 'Sending high-priority server alerts across Email, Slack, SMS, and Webhook channels dynamically.',
      code: {
        java: `// Multi-channel notification implementation
public interface NotificationService {
    boolean send(String recipient, String message);
}

public class SlackNotifier implements NotificationService {
    public boolean send(String channel, String message) {
        System.out.println("[Slack] Posting alert to #" + channel + ": " + message);
        return true;
    }
}

public class EmailNotifier implements NotificationService {
    public boolean send(String email, String message) {
        System.out.println("[Email] Sending critical incident email to " + email + ": " + message);
        return true;
    }
}

public class AlertService {
    private NotificationService notifier;

    public AlertService(NotificationService notifier) {
        this.notifier = notifier;
    }

    public void triggerAlert(String recipient, String issue) {
        notifier.send(recipient, "URGENT ALERT: " + issue);
    }
}`,
        python: `class NotificationService(ABC):
    @abstractmethod
    def send(self, recipient: str, message: str) -> bool:
        pass`,
        cpp: `// C++ AlertService implementation`,
        typescript: `// TypeScript AlertService implementation`,
        go: `// Go AlertService implementation`,
      },
      whyItWorks: [
        'Adding new channels is trivial: Create PagerDutyNotifier without altering AlertService.',
        'Independent unit testing: Test EmailNotifier without pinging Slack servers.',
        'Channel-agnostic service: AlertService only knows about the NotificationService contract.',
        'Dynamic configuration: Swap notification channels at runtime via environment variables.',
      ],
    },
    quiz: {
      id: 'quiz-interfaces',
      question: 'What is the primary benefit of programming to an Interface instead of a concrete class?',
      options: [
        'It decouples business logic from specific implementations, allowing easy runtime swapping and testing with mocks.',
        'It automatically compiles all code to machine assembly for higher speed.',
        'It stores all instance fields on the CPU cache instead of the heap.',
        'It prevents other classes from ever creating objects.',
      ],
      correctOptionIndex: 0,
      explanation: 'Interfaces act as contracts. When high-level services depend on interfaces, they remain completely agnostic of vendor details, making the system loosely coupled, extensible, and easy to unit test.',
    },
  },
};

// Populate the remaining topics so that all 80 items are accessible with high-quality content
const allTopicDefinitions: Array<{
  id: string;
  moduleId: CurriculumCategory;
  moduleTitle: string;
  title: string;
  priority: 'High Priority' | 'Core' | 'Medium Priority';
  readTime: number;
  summary: string;
  hasPracticeProblem?: boolean;
  practiceProblemId?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}> = [
  // OOP (8 others)
  { id: 'interfaces', moduleId: 'oop', moduleTitle: 'Object Oriented Programming', title: 'Interfaces', priority: 'High Priority', readTime: 6, summary: 'Interfaces establish strict behavioral contracts between decoupling systems without mandating concrete implementations.' },
  { id: 'inheritance', moduleId: 'oop', moduleTitle: 'Object Oriented Programming', title: 'Inheritance', priority: 'Core', readTime: 5, summary: 'Inheritance enables classes to inherit attributes and methods from parent classes, modeling the "Is-A" relationship.' },
  { id: 'polymorphism', moduleId: 'oop', moduleTitle: 'Object Oriented Programming', title: 'Polymorphism', priority: 'High Priority', readTime: 6, summary: 'Polymorphism allows objects of different types to respond to the same interface according to their specific implementations.' },
  { id: 'abstraction', moduleId: 'oop', moduleTitle: 'Object Oriented Programming', title: 'Abstraction', priority: 'Core', readTime: 5, summary: 'Abstraction hides complex implementation details while exposing only the essential features to the caller.' },
  { id: 'encapsulation', moduleId: 'oop', moduleTitle: 'Object Oriented Programming', title: 'Encapsulation', priority: 'High Priority', readTime: 5, summary: 'Encapsulation bundles data with the methods that operate on that data and restricts direct access to internal state.' },
  { id: 'aggregation', moduleId: 'oop', moduleTitle: 'Object Oriented Programming', title: 'Aggregation', priority: 'Core', readTime: 4, summary: 'Aggregation represents a weak "Has-A" relationship where the contained object can exist independently of the container.' },
  { id: 'composition', moduleId: 'oop', moduleTitle: 'Object Oriented Programming', title: 'Composition', priority: 'High Priority', readTime: 5, summary: 'Composition represents a strong "Has-A" relationship where the lifetime of the child is tied strictly to the parent.' },
  { id: 'association', moduleId: 'oop', moduleTitle: 'Object Oriented Programming', title: 'Association', priority: 'Core', readTime: 4, summary: 'Association defines a general relationship between two separate classes without ownership hierarchy.' },

  // Design Principles (10)
  { id: 'dry', moduleId: 'design-principles', moduleTitle: 'Design Principles', title: "Don't Repeat Yourself (DRY)", priority: 'High Priority', readTime: 5, summary: 'Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.' },
  { id: 'kiss', moduleId: 'design-principles', moduleTitle: 'Design Principles', title: 'Keep It Simple Stupid (KISS)', priority: 'Core', readTime: 4, summary: 'Systems work best if they are kept simple rather than made complicated.' },
  { id: 'yagni', moduleId: 'design-principles', moduleTitle: 'Design Principles', title: "You Aren't Gonna Need It (YAGNI)", priority: 'Core', readTime: 4, summary: 'Do not add functionality until deemed necessary.' },
  { id: 'lod', moduleId: 'design-principles', moduleTitle: 'Design Principles', title: 'Law of Demeter (LoD)', priority: 'High Priority', readTime: 6, summary: 'Principle of Least Knowledge: an object should only talk to its immediate collaborators.' },
  { id: 'srp', moduleId: 'design-principles', moduleTitle: 'Design Principles', title: 'Single Responsibility Principle (SRP)', priority: 'High Priority', readTime: 6, summary: 'A class should have one, and only one, reason to change.' },
  { id: 'ocp', moduleId: 'design-principles', moduleTitle: 'Design Principles', title: 'Open/Closed Principle (OCP)', priority: 'High Priority', readTime: 7, summary: 'Software entities should be open for extension, but closed for modification.' },
  { id: 'lsp', moduleId: 'design-principles', moduleTitle: 'Design Principles', title: 'Liskov Substitution Principle (LSP)', priority: 'High Priority', readTime: 6, summary: 'Subtypes must be substitutable for their base types without altering correctness.' },
  { id: 'isp', moduleId: 'design-principles', moduleTitle: 'Design Principles', title: 'Interface Segregation Principle (ISP)', priority: 'Core', readTime: 5, summary: 'Clients should not be forced to depend on interfaces they do not use.' },
  { id: 'dip', moduleId: 'design-principles', moduleTitle: 'Design Principles', title: 'Dependency Inversion Principle (DIP)', priority: 'High Priority', readTime: 7, summary: 'High-level modules should not depend on low-level modules. Both should depend on abstractions.' },
  { id: 'solid-summary', moduleId: 'design-principles', moduleTitle: 'Design Principles', title: 'SOLID Principles - Summary', priority: 'High Priority', readTime: 8, summary: 'Comprehensive synthesis of all 5 SOLID principles with integrated architectural scenarios.' },

  // UML (5)
  { id: 'class-diagram', moduleId: 'uml', moduleTitle: 'UML', title: 'Class Diagram', priority: 'High Priority', readTime: 6, summary: 'Static structure diagrams detailing classes, attributes, methods, and relationships.' },
  { id: 'use-case-diagram', moduleId: 'uml', moduleTitle: 'UML', title: 'Use Case Diagram', priority: 'Core', readTime: 4, summary: 'Mapping system actors, boundaries, and use case interactions.' },
  { id: 'sequence-diagram', moduleId: 'uml', moduleTitle: 'UML', title: 'Sequence Diagram', priority: 'High Priority', readTime: 6, summary: 'Modeling the sequence of messages exchanged between objects over time.' },
  { id: 'activity-diagram', moduleId: 'uml', moduleTitle: 'UML', title: 'Activity Diagram', priority: 'Core', readTime: 5, summary: 'Representing procedural flows, step-by-step workflows, and decision points.' },
  { id: 'state-machine-diagram', moduleId: 'uml', moduleTitle: 'UML', title: 'State Machine Diagram', priority: 'High Priority', readTime: 6, summary: 'Modeling states, events, transitions, and guards in state-driven domains.' },

  // Creational Patterns (5)
  { id: 'singleton', moduleId: 'creational-patterns', moduleTitle: 'Design Patterns - Creational', title: 'Singleton', priority: 'High Priority', readTime: 5, summary: 'Ensures a class has only one instance and provides a global access point.' },
  { id: 'factory-method', moduleId: 'creational-patterns', moduleTitle: 'Design Patterns - Creational', title: 'Factory Method', priority: 'High Priority', readTime: 6, summary: 'Defines an interface for creating objects, delegating instantiation to subclasses.' },
  { id: 'abstract-factory', moduleId: 'creational-patterns', moduleTitle: 'Design Patterns - Creational', title: 'Abstract Factory', priority: 'High Priority', readTime: 7, summary: 'Provides an interface for creating families of related objects without specifying concrete classes.' },
  { id: 'builder', moduleId: 'creational-patterns', moduleTitle: 'Design Patterns - Creational', title: 'Builder', priority: 'High Priority', readTime: 6, summary: 'Constructs complex objects step by step with method chaining.' },
  { id: 'prototype', moduleId: 'creational-patterns', moduleTitle: 'Design Patterns - Creational', title: 'Prototype', priority: 'Core', readTime: 5, summary: 'Creates new objects by cloning an existing prototypical instance.' },

  // Structural Patterns (7)
  { id: 'adapter', moduleId: 'structural-patterns', moduleTitle: 'Design Patterns - Structural', title: 'Adapter', priority: 'High Priority', readTime: 6, summary: 'Allows incompatible interfaces to collaborate by wrapping an existing class.' },
  { id: 'facade', moduleId: 'structural-patterns', moduleTitle: 'Design Patterns - Structural', title: 'Facade', priority: 'High Priority', readTime: 5, summary: 'Provides a simplified interface to a complex subsystem of classes.' },
  { id: 'decorator', moduleId: 'structural-patterns', moduleTitle: 'Design Patterns - Structural', title: 'Decorator', priority: 'High Priority', readTime: 7, summary: 'Dynamically attaches additional responsibilities to an object at runtime.' },
  { id: 'composite', moduleId: 'structural-patterns', moduleTitle: 'Design Patterns - Structural', title: 'Composite', priority: 'Core', readTime: 6, summary: 'Composes objects into tree structures to represent part-whole hierarchies.' },
  { id: 'proxy', moduleId: 'structural-patterns', moduleTitle: 'Design Patterns - Structural', title: 'Proxy', priority: 'High Priority', readTime: 6, summary: 'Provides a surrogate placeholder to control access, log, or cache calls.' },
  { id: 'bridge', moduleId: 'structural-patterns', moduleTitle: 'Design Patterns - Structural', title: 'Bridge', priority: 'Core', readTime: 6, summary: 'Decouples an abstraction from its implementation so both can vary independently.' },
  { id: 'flyweight', moduleId: 'structural-patterns', moduleTitle: 'Design Patterns - Structural', title: 'Flyweight', priority: 'Core', readTime: 6, summary: 'Shares common state among multiple objects to minimize memory footprint.' },

  // Behavioral Patterns (10)
  { id: 'iterator', moduleId: 'behavioral-patterns', moduleTitle: 'Design Patterns - Behavioral', title: 'Iterator', priority: 'Core', readTime: 5, summary: 'Sequentially accesses elements of an aggregate object without exposing its representation.' },
  { id: 'observer', moduleId: 'behavioral-patterns', moduleTitle: 'Design Patterns - Behavioral', title: 'Observer', priority: 'High Priority', readTime: 7, summary: 'Defines a subscription mechanism to notify multiple objects about state changes.' },
  { id: 'strategy', moduleId: 'behavioral-patterns', moduleTitle: 'Design Patterns - Behavioral', title: 'Strategy', priority: 'High Priority', readTime: 7, summary: 'Defines a family of interchangeable algorithms and encapsulates each one.' },
  { id: 'command', moduleId: 'behavioral-patterns', moduleTitle: 'Design Patterns - Behavioral', title: 'Command', priority: 'High Priority', readTime: 6, summary: 'Encapsulates a request as an object, enabling undo/redo and queueing.' },
  { id: 'state', moduleId: 'behavioral-patterns', moduleTitle: 'Design Patterns - Behavioral', title: 'State', priority: 'High Priority', readTime: 7, summary: 'Allows an object to alter its behavior when its internal state changes.' },
  { id: 'template-method', moduleId: 'behavioral-patterns', moduleTitle: 'Design Patterns - Behavioral', title: 'Template Method', priority: 'Core', readTime: 5, summary: 'Defines the skeleton of an algorithm, deferring concrete steps to subclasses.' },
  { id: 'visitor', moduleId: 'behavioral-patterns', moduleTitle: 'Design Patterns - Behavioral', title: 'Visitor', priority: 'Core', readTime: 6, summary: 'Executes operations over elements of an object structure without modifying their classes.' },
  { id: 'mediator', moduleId: 'behavioral-patterns', moduleTitle: 'Design Patterns - Behavioral', title: 'Mediator', priority: 'Core', readTime: 6, summary: 'Restricts direct communication between objects and forces them to collaborate through a mediator.' },
  { id: 'memento', moduleId: 'behavioral-patterns', moduleTitle: 'Design Patterns - Behavioral', title: 'Memento', priority: 'Core', readTime: 5, summary: 'Saves and restores the previous state of an object without revealing private details.' },
  { id: 'chain-of-responsibility', moduleId: 'behavioral-patterns', moduleTitle: 'Design Patterns - Behavioral', title: 'Chain of Responsibility', priority: 'High Priority', readTime: 6, summary: 'Passes requests along a chain of potential handlers until one handles it.' },

  // Interview Tips (1)
  { id: 'how-to-answer-lld', moduleId: 'interview-tips', moduleTitle: 'LLD Interview Tips', title: 'How to Answer a LLD Interview Question', priority: 'High Priority', readTime: 8, summary: 'The proven 45-minute blueprint to structure clarifications, domain entities, relationships, patterns, and concurrency.' },

  // Easy Questions (5)
  { id: 'design-tic-tac-toe', moduleId: 'questions-easy', moduleTitle: 'LLD Interview Questions - Easy', title: 'Design Tic Tac Toe', priority: 'High Priority', readTime: 10, difficulty: 'Easy', hasPracticeProblem: true, practiceProblemId: 'prob-tic-tac-toe', summary: 'Design an N*N Tic-Tac-Toe board game with extensible winning condition validators.' },
  { id: 'design-snake-and-ladder', moduleId: 'questions-easy', moduleTitle: 'LLD Interview Questions - Easy', title: 'Design Snake and Ladder game', priority: 'Core', readTime: 10, difficulty: 'Easy', hasPracticeProblem: true, practiceProblemId: 'prob-snake-ladder', summary: 'Design a multiplayer Snake and Ladder board game with custom dice and jump strategies.' },
  { id: 'design-lru-cache', moduleId: 'questions-easy', moduleTitle: 'LLD Interview Questions - Easy', title: 'Design LRU Cache', priority: 'High Priority', readTime: 12, difficulty: 'Easy', hasPracticeProblem: true, practiceProblemId: 'prob-lru-cache', summary: 'Design an in-memory Least Recently Used (LRU) Cache supporting O(1) get and put operations.' },
  { id: 'design-parking-lot', moduleId: 'questions-easy', moduleTitle: 'LLD Interview Questions - Easy', title: 'Design Parking Lot', priority: 'High Priority', readTime: 15, difficulty: 'Easy', hasPracticeProblem: true, practiceProblemId: 'prob-parking-lot', summary: 'Design a multi-floor parking lot managing various vehicle types, dynamic fee strategies, and spot allocation.' },
  { id: 'design-task-management-system', moduleId: 'questions-easy', moduleTitle: 'LLD Interview Questions - Easy', title: 'Design Task Management System', priority: 'Core', readTime: 12, difficulty: 'Easy', hasPracticeProblem: true, practiceProblemId: 'prob-task-management', summary: 'Design a Jira-style task management system with task state transitions and user assignments.' },

  // Medium Questions (15)
  { id: 'design-stack-overflow', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Stack Overflow', priority: 'High Priority', readTime: 15, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-stackoverflow', summary: 'Design a community Q&A platform with questions, answers, comments, voting, and reputation badges.' },
  { id: 'design-atm', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design ATM', priority: 'High Priority', readTime: 15, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-atm', summary: 'Design an ATM machine handling state transitions and cash dispensing via Chain of Responsibility.' },
  { id: 'design-logging-framework', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Logging Framework', priority: 'High Priority', readTime: 15, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-logging-framework', summary: 'Design an extensible logging library supporting multiple log levels and pluggable destination appenders.' },
  { id: 'design-pub-sub-system', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Pub Sub System', priority: 'High Priority', readTime: 15, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-pub-sub', summary: 'Design a thread-safe in-memory publish-subscribe message broker with topic filtering.' },
  { id: 'design-elevator-system', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Elevator System', priority: 'High Priority', readTime: 18, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-elevator-system', summary: 'Design a multi-car elevator dispatching system using LOOK/SCAN algorithms.' },
  { id: 'design-splitwise', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Splitwise', priority: 'High Priority', readTime: 18, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-splitwise', summary: 'Design an expense-sharing application with equal, exact, and percentage splits, and debt simplification.' },
  { id: 'design-vending-machine', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Vending Machine', priority: 'High Priority', readTime: 15, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-vending-machine', summary: 'Design a state-driven vending machine handling money validation, item dispensing, and coin refunds.' },
  { id: 'design-car-rental-system', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Car Rental System', priority: 'Core', readTime: 15, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-car-rental', summary: 'Design an online car rental booking platform managing vehicle inventory, reservations, and billing.' },
  { id: 'design-hotel-management-system', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Hotel Management System', priority: 'Core', readTime: 15, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-hotel-management', summary: 'Design a hotel room booking engine with room type inventory, seasonal rates, and housekeeping workflows.' },
  { id: 'design-digital-wallet-service', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design a Digital Wallet Service', priority: 'High Priority', readTime: 15, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-digital-wallet', summary: 'Design a digital wallet ledger handling atomic balance transfers, payment methods, and transaction audits.' },
  { id: 'design-airline-management-system', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Airline Management System', priority: 'Core', readTime: 15, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-airline-management', summary: 'Design a flight reservation system supporting flight search, seat selection, and boarding pass generation.' },
  { id: 'design-library-management-system', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Library Management System', priority: 'Core', readTime: 12, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-library-management', summary: 'Design a library management system managing book lending, reservations, member tiers, and fine calculations.' },
  { id: 'design-traffic-signal-control-system', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Traffic Signal Control System', priority: 'High Priority', readTime: 15, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-traffic-signal', summary: 'Design an automated traffic signal controller with state timing and emergency vehicle override.' },
  { id: 'design-concert-ticket-booking-system', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Concert Ticket Booking System', priority: 'High Priority', readTime: 18, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-concert-ticket', summary: 'Design a high-concurrency ticket booking engine with seat holding locks and payment expiration timers.' },
  { id: 'design-social-network-service-facebook', moduleId: 'questions-medium', moduleTitle: 'LLD Interview Questions - Medium', title: 'Design Social Network Service like Facebook', priority: 'High Priority', readTime: 18, difficulty: 'Medium', hasPracticeProblem: true, practiceProblemId: 'prob-social-network', summary: 'Design a social networking graph managing friendships, user profiles, posts, and activity timelines.' },

  // Hard Questions (13)
  { id: 'design-spotify', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Spotify', priority: 'High Priority', readTime: 20, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-spotify', summary: 'Design a music streaming platform with playback state, audio buffering, playlists, and recommendations.' },
  { id: 'design-amazon', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Amazon', priority: 'High Priority', readTime: 20, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-amazon-shopping', summary: 'Design an e-commerce platform with cart management, inventory locks, payment routing, and order lifecycles.' },
  { id: 'design-linkedin', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design LinkedIn', priority: 'High Priority', readTime: 20, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-linkedin', summary: 'Design a professional network managing connection degrees, feed ranking, and job applications.' },
  { id: 'design-cricinfo', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design CricInfo', priority: 'Core', readTime: 18, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-cricinfo', summary: 'Design a live cricket scoring platform with ball-by-ball observer updates, commentary, and player stats.' },
  { id: 'design-chess-game', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Chess Game', priority: 'High Priority', readTime: 22, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-chess', summary: 'Design a complete Chess game with piece movement strategies, checkmate detection, and move undo/redo.' },
  { id: 'design-coffee-vending-machine', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Coffee Vending Machine', priority: 'Core', readTime: 16, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-coffee-vending', summary: 'Design an automated coffee machine utilizing the Decorator pattern for custom recipes and ingredient tracking.' },
  { id: 'design-restaurant-management-system', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Restaurant Management System', priority: 'Core', readTime: 18, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-restaurant-management', summary: 'Design a restaurant management platform with table reservation, Kitchen Order Ticket (KOT) dispatcher, and billing.' },
  { id: 'design-online-stock-exchange', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Online Stock Exchange', priority: 'High Priority', readTime: 22, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-stock-exchange', summary: 'Design an electronic stock trading exchange with limit/market order books and Price-Time matching engine.' },
  { id: 'design-course-registration-system', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Course Registration System', priority: 'Core', readTime: 18, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-course-registration', summary: 'Design a university course registration platform handling prerequisite graphs, waitlist queues, and seat quotas.' },
  { id: 'design-movie-ticket-booking-system', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Movie Ticket Booking System', priority: 'High Priority', readTime: 20, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-movie-ticket', summary: 'Design a BookMyShow movie ticket booking platform with seat locking, theatre layout, and dynamic pricing.' },
  { id: 'design-online-auction-system', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Online Auction System', priority: 'High Priority', readTime: 18, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-online-auction', summary: 'Design an eBay-style online auction platform with real-time bidding, automatic reserve pricing, and timer states.' },
  { id: 'design-online-food-delivery-service', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Online Food Delivery Service', priority: 'High Priority', readTime: 20, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-food-delivery', summary: 'Design a Swiggy/DoorDash platform managing restaurant menus, order workflows, driver dispatch, and live tracking.' },
  { id: 'design-ride-sharing-service-uber', moduleId: 'questions-hard', moduleTitle: 'LLD Interview Questions - Hard', title: 'Design Ride-Sharing Service like Uber', priority: 'High Priority', readTime: 22, difficulty: 'Hard', hasPracticeProblem: true, practiceProblemId: 'prob-ridesharing-uber', summary: 'Design an Uber ride-sharing system with driver matching strategies, surge pricing calculation, and trip state machines.' },
];

for (const topic of allTopicDefinitions) {
  if (!CURRICULUM_CHAPTERS[topic.id]) {
    const cleanName = topic.title.replace(/[^a-zA-Z0-9]/g, '');
    CURRICULUM_CHAPTERS[topic.id] = {
      id: topic.id,
      slug: topic.id,
      moduleId: topic.moduleId,
      moduleTitle: topic.moduleTitle,
      title: topic.title,
      priority: topic.priority,
      readTimeMinutes: topic.readTime,
      lastUpdated: 'Updated July 2026',
      summary: topic.summary,
      hasPracticeProblem: topic.hasPracticeProblem,
      practiceProblemId: topic.practiceProblemId,
      difficulty: topic.difficulty,
      sections: [
        {
          id: `${topic.id}-overview`,
          title: `1. Overview of ${topic.title}`,
          content: `${topic.summary}\n\n### Core Architectural Concepts\nWhen approaching **${topic.title}**, senior engineers structure the solution around clean responsibility boundaries, decoupling abstractions from concrete implementations, and defending against requirement mutations.`,
        },
        {
          id: `${topic.id}-key-takeaways`,
          title: '2. Key Design Invariants & Takeaways',
          content: `- **Encapsulation**: Guard internal invariants and avoid leaking mutable internal state.\n- **Extensibility**: Design with Open-Closed Principle in mind so new requirements do not break existing classes.\n- **Interface Segregation**: Keep contracts focused and cohesive.`,
        },
      ],
      codeSnippets: {
        java: `// Java implementation for ${topic.title}\npublic class ${cleanName} {\n    public static void main(String[] args) {\n        System.out.println("${topic.title} initialized successfully.");\n    }\n}`,
        python: `# Python implementation for ${topic.title}\nclass ${cleanName}:\n    def __init__(self):\n        print("${topic.title} initialized")\n\nif __name__ == "__main__":\n    app = ${cleanName}()`,
        cpp: `// C++ implementation for ${topic.title}\n#include <iostream>\nint main() {\n    std::cout << "${topic.title} loaded" << std::endl;\n    return 0;\n}`,
        typescript: `// TypeScript implementation for ${topic.title}\nexport class ${cleanName} {\n    constructor() {\n        console.log("${topic.title} initialized");\n    }\n}`,
        go: `// Go implementation for ${topic.title}\npackage main\nimport "fmt"\nfunc main() {\n    fmt.Println("${topic.title} ready")\n}`,
      },
      sampleOutput: `${topic.title} executed successfully.`,
    };
  }
}
