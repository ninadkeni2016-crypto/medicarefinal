import React, { useRef, useEffect } from 'react';
import { View, Modal, ActivityIndicator, Platform, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

interface RazorpayCheckoutProps {
    amount: number;
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onCancel?: () => void;
    description?: string;
    prefillName?: string;
    prefillEmail?: string;
    prefillContact?: string;
}

const RAZORPAY_KEY_ID = 'rzp_test_SDfyU8TgeU3pcJ';

export default function RazorpayCheckout({
    amount,
    visible,
    onClose,
    onSuccess,
    onCancel,
    description = 'MediCare Consultation',
    prefillName = '',
    prefillEmail = '',
    prefillContact = '',
}: RazorpayCheckoutProps) {
    const webviewRef = useRef<WebView>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const amountInPaise = Math.round(amount * 100);

    // ─── Web platform: listen for postMessage from the iframe ───────────────
    useEffect(() => {
        if (Platform.OS !== 'web' || !visible) return;

        const handleWebMessage = (event: MessageEvent) => {
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (data?.source !== 'razorpay-iframe') return;

                if (data.type === 'success') {
                    onSuccess();
                } else if (data.type === 'cancelled' || data.type === 'dismissed') {
                    onCancel ? onCancel() : onClose();
                } else if (data.type === 'error') {
                    onCancel ? onCancel() : onClose();
                }
            } catch {
                // ignore non-JSON messages
            }
        };

        window.addEventListener('message', handleWebMessage);
        return () => window.removeEventListener('message', handleWebMessage);
    }, [visible, onClose, onSuccess, onCancel]);

    // ─── HTML injected into WebView / iframe ────────────────────────────────
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        body { 
            margin: 0; padding: 0; 
            background-color: transparent; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100vh;
        }
        .loader {
            border: 4px solid rgba(0,0,0,0.1);
            border-left-color: #2563EB;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
    </style>
</head>
<body>
    <div class="loader" id="loader"></div>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <script>
        function sendMessage(data) {
            var msg = JSON.stringify(Object.assign({ source: 'razorpay-iframe' }, data));
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(msg);
            }
            if (window.parent && window.parent !== window) {
                window.parent.postMessage(msg, '*');
            }
        }

        window.onload = function() {
            var options = {
                key: '${RAZORPAY_KEY_ID}',
                amount: ${amountInPaise},
                currency: 'INR',
                name: 'MediCare Hub',
                description: '${description}',
                theme: { color: '#2563EB' },
                handler: function(response) {
                    sendMessage({ type: 'success', paymentId: response.razorpay_payment_id });
                },
                prefill: {
                    name: '${prefillName || 'Patient'}',
                    email: '${prefillEmail || 'patient@medicare.com'}',
                    contact: '${prefillContact || '9999999999'}'
                },
                modal: {
                    ondismiss: function() {
                        sendMessage({ type: 'dismissed' });
                    },
                    animation: true
                }
            };
            var rzp = new Razorpay(options);
            rzp.on('payment.failed', function(response) {
                sendMessage({ type: 'error', error: response.error.description });
            });
            rzp.open();
            
            setTimeout(function() {
                document.getElementById('loader').style.display = 'none';
            }, 500);
        };
    </script>
</body>
</html>
`;

    const handleNativeMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data?.source !== 'razorpay-iframe') return;

            if (data.type === 'success') {
                onSuccess();
            } else if (data.type === 'cancelled' || data.type === 'dismissed') {
                onCancel ? onCancel() : onClose();
            } else if (data.type === 'error') {
                onCancel ? onCancel() : onClose();
            }
        } catch {
            // ignore
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => {
                onCancel ? onCancel() : onClose();
            }}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <SafeAreaView style={{ flex: 1 }}>
                    {Platform.OS === 'web' ? (
                        <iframe
                            ref={iframeRef as any}
                            srcDoc={htmlContent}
                            style={{ flex: 1, border: 'none', width: '100%', height: '100%', backgroundColor: 'transparent' } as any}
                            title="Razorpay Checkout"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                        />
                    ) : (
                        <WebView
                            ref={webviewRef}
                            source={{ html: htmlContent }}
                            onMessage={handleNativeMessage}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={false}
                            style={{ flex: 1, backgroundColor: 'transparent' }}
                            originWhitelist={['*']}
                            bounces={false}
                            scalesPageToFit={false}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </SafeAreaView>
            </View>
        </Modal>
    );
}
